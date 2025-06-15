import dotenv from "dotenv"
import mongoose from "mongoose";
import { chatConsumer, producer } from "../kafka/kafka.js";
import { fetchChatMessagesFromDB, fetchChatsFromDB, fetchPrivateChat, storeMessageInDB } from "../controller/chatController.js";
dotenv.config({ path: './.env' })

export const runChatConsumer = async () => {
    try {
        console.log('Starting chat consumer...');
        await mongoose.connect(process.env.MONGO_DB_URI)
        console.log(`Worker connected to MongoDB`);

        console.log('Connecting chat consumer to Kafka...');
        await chatConsumer.connect()
        console.log('Chat consumer connected to Kafka');

        console.log('Subscribing to Kafka topics...');
        await chatConsumer.subscribe({
            topic: 'send-message',
            fromBeginning: true
        })
        console.log('Subscribed to send-message topic');

        await chatConsumer.subscribe({
            topic: "fetch-chats-req",
            fromBeginning: true
        })
        console.log('Subscribed to fetch-chats-req topic');

        await chatConsumer.subscribe({
            topic: "fetch-chat-msg-req",
            fromBeginning: true
        })
        console.log('Subscribed to fetch-chat-msg-req topic');

        await chatConsumer.subscribe({
            topic: "private-chat-req",
            fromBeginning: true
        })
        console.log('Subscribed to private-chat-req topic');

        console.log('Connecting producer to Kafka...');
        await producer.connect()
        console.log('Producer connected to Kafka');

        console.log('Starting chat consumer message processing...');
        await chatConsumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(`Received message on topic: ${topic}, partition: ${partition}`);
                try {
                    const incomingData = JSON.parse(message.value.toString())
                    console.log(`Processing message for topic ${topic}:`, incomingData);

                    let dbResult
                    switch (topic) {
                        case "send-message":
                            const { message } = incomingData.data
                            dbResult = await storeMessageInDB(message)
                            if (dbResult.success) {
                                await producer.send({
                                    topic: "send-message-res",
                                    messages: [
                                        {
                                            key: incomingData.correlationId,
                                            value: JSON.stringify({
                                                dbResult,
                                                correlationId: incomingData.correlationId
                                            })
                                        }
                                    ]
                                })
                            }
                            break;
                        case "fetch-chats-req":
                            console.log('=== Processing fetch-chats-req ===');
                            console.log('Incoming data:', incomingData);
                            
                            if (!incomingData.data || !incomingData.data.userId) {
                                console.error('Missing userId in request');
                                await producer.send({
                                    topic: 'fetch-chats-res',
                                    messages: [
                                        {
                                            key: incomingData.correlationId,
                                            value: JSON.stringify({
                                                data: [],
                                                correlationId: incomingData.correlationId
                                            })
                                        }
                                    ]
                                });
                                return;
                            }
                            
                            const userId = incomingData.data.userId;
                            console.log('User ID:', userId);
                            
                            const dbResult = await fetchChatsFromDB(userId);
                            console.log('Fetch chats result:', dbResult);
                            
                            if (dbResult.success) {
                                console.log('Sending chats response to Kafka');
                                const responseData = {
                                    data: dbResult.data,
                                    correlationId: incomingData.correlationId
                                };
                                console.log('Response data to be sent:', responseData);
                                
                                await producer.send({
                                    topic: 'fetch-chats-res',
                                    messages: [
                                        {
                                            key: incomingData.correlationId,
                                            value: JSON.stringify(responseData)
                                        }
                                    ]
                                });
                                console.log('Chats response sent to Kafka');
                            } else {
                                console.log('Failed to fetch chats');
                                const errorResponse = {
                                    data: [],
                                    correlationId: incomingData.correlationId
                                };
                                console.log('Error response to be sent:', errorResponse);
                                
                                await producer.send({
                                    topic: 'fetch-chats-res',
                                    messages: [
                                        {
                                            key: incomingData.correlationId,
                                            value: JSON.stringify(errorResponse)
                                        }
                                    ]
                                });
                            }
                            console.log('=== fetch-chats-req Processing Complete ===');
                            break;
                        case "fetch-chat-msg-req":
                            try {
                                console.log('Processing message for topic fetch-chat-msg-req:', incomingData);
                                const { chatId } = incomingData.data;
                                console.log('Fetching messages for chatId:', chatId);

                                const result = await fetchChatMessagesFromDB(chatId);
                                console.log('Fetch messages result:', result);

                                await producer.send({
                                    topic: "fetch-chat-msg-res",
                                    messages: [
                                        {
                                            value: JSON.stringify({
                                                dbResult,
                                                correlationId: incomingData.correlationId
                                            })
                                        }
                                    ]
                                });
                                console.log('Sent fetch-chat-msg-res response');
                            } catch (error) {
                                console.error('Error processing message for topic fetch-chat-msg-req:', error);
                            }
                            break;
                        case "private-chat-req":
                            console.log('=== Processing private-chat-req ===');
                            console.log('Incoming data:', incomingData);
                            
                            if (!incomingData.data || !incomingData.data.currentUser || !incomingData.data.reciever) {
                                console.error('Missing required data in request');
                                await producer.send({
                                    topic: 'private-chat-res',
                                    messages: [
                                        {
                                            key: incomingData.correlationId,
                                            value: JSON.stringify({
                                                data: [],
                                                correlationId: incomingData.correlationId
                                            })
                                        }
                                    ]
                                });
                                return;
                            }
                            
                            const { currentUser, reciever } = incomingData.data;
                            console.log('Sender ID:', currentUser);
                            console.log('Receiver ID:', reciever);
                            
                            try {
                                const dbResult = await fetchPrivateChat(currentUser, reciever);
                                console.log('Fetch private chat result:', dbResult);
                                
                                if (dbResult.success) {
                                    console.log('Sending private chat response to Kafka');
                                    const responseData = {
                                        data: dbResult.data,
                                        correlationId: incomingData.correlationId
                                    };
                                    console.log('Response data to be sent:', responseData);
                                    
                                    await producer.send({
                                        topic: 'private-chat-res',
                                        messages: [
                                            {
                                                key: incomingData.correlationId,
                                                value: JSON.stringify(responseData)
                                            }
                                        ]
                                    });
                                    console.log('Private chat response sent to Kafka');
                                } else {
                                    console.log('Failed to fetch private chat');
                                    const errorResponse = {
                                        data: [],
                                        correlationId: incomingData.correlationId
                                    };
                                    console.log('Error response to be sent:', errorResponse);
                                    
                                    await producer.send({
                                        topic: 'private-chat-res',
                                        messages: [
                                            {
                                                key: incomingData.correlationId,
                                                value: JSON.stringify(errorResponse)
                                            }
                                        ]
                                    });
                                }
                            } catch (error) {
                                console.error('Error processing private chat request:', error);
                                await producer.send({
                                    topic: 'private-chat-res',
                                    messages: [
                                        {
                                            key: incomingData.correlationId,
                                            value: JSON.stringify({
                                                data: [],
                                                correlationId: incomingData.correlationId
                                            })
                                        }
                                    ]
                                });
                            }
                            console.log('=== private-chat-req Processing Complete ===');
                            break;
                        default:
                            console.log(`Unknown topic for chat service: ${topic}`);
                            break;
                    }
                } catch (error) {
                    console.error(`Error processing message for topic ${topic}:`, error);
                }
            }
        })
        console.log('Chat consumer message processing started');

    } catch (err) {
        console.error('Error in runChatConsumer:', err);
        return {
            success: false,
            message: err.message
        }
    }
}