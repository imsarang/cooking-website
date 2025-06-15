import { consumer, pendingResponses, producer } from "../kafka.js"
import websocketService from "./websocketService.js"
import { v4 as uuidv4 } from 'uuid'

export const sendMessageToKafka = async (message) => {
    try {
        console.log('=== Kafka Message Processing START ===');
        console.log('Message received for Kafka processing:', JSON.stringify(message, null, 2));
        
        console.log('Connecting to Kafka producer...');
        await producer.connect()
        console.log('Kafka producer connected successfully');
        
        const data = {
            message: message
        }
        console.log('Prepared message data:', JSON.stringify(data, null, 2));

        const correlationId = getCorelationId()
        console.log('Generated correlation ID:', correlationId);

        console.log('Sending message to Kafka topic: send-message');
        const result = await producer.send({
            topic: 'send-message',
            messages: [
                {
                    key: correlationId,
                    value: JSON.stringify({ data, correlationId })
                }
            ]
        })
        console.log('Kafka send result:', result);
        console.log('=== Kafka Message Processing END ===');
    }
    catch (err) {
        console.error('=== Kafka Message Processing ERROR ===');
        console.error('Error details:', err);
        console.error('Failed message:', message);
        console.error('=== Kafka Message Processing ERROR END ===');
        return {
            success: false,
            message: err.message
        }
    }
}

export const sendReqForUserChats = async (req, res) => {
    try {
        console.log('=== Sending User Chats Request ===');
        
        if (!req || !req.params || !req.params.userId) {
            console.error('Invalid request object or missing userId');
            if (res) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid request or missing userId'
                });
            }
            return;
        }

        const userId = req.params.userId;
        console.log('User ID:', userId);
        
        await producer.connect();
        const correlationId = getCorelationId();
        
        const data = {
            userId: userId
        };

        console.log('Sending request to Kafka:', {
            topic: 'fetch-chats-req',
            data,
            correlationId
        });

        await producer.send({
            topic: 'fetch-chats-req',
            messages: [
                {
                    key: correlationId,
                    value: JSON.stringify({
                        data,
                        correlationId
                    })
                }
            ]
        });
        
        // Store the response object to send back later
        if (res) {
            pendingResponses.set(correlationId, res);
        }
        
        console.log('=== User Chats Request Sent ===');
    }
    catch (err) {
        console.error('=== Error in sendReqForUserChats ===');
        console.error('Error details:', err);
        console.error('=== Error in sendReqForUserChats END ===');
        
        if (res) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
}

export const sendReqForPrivateChat = async (req, res) => {
    try{
        await producer.connect()
        const correlationId = getCorelationId()

        const currentUser = req.params.user1;
        const reciever = req.params.user2

        const data = {
            currentUser: currentUser,
            reciever: reciever
        }

        await producer.send({
            topic: "private-chat-req",
            messages: [
                {
                    key: correlationId,
                    value: JSON.stringify({data, correlationId})
                }
            ]
        })
        pendingResponses.set(correlationId, res)

        console.log("Request to kafka worker sent for private chat");
        
    }catch(err)
    {
        console.error("Error sending private chat request:", err);
        return {
            success: false,
            message: err.message
        }
    }
}

// send request for chat messages to kafka worker
export const sendReqForChatMessages = async (req, res) => {
    try {
        console.log('=== Sending Chat Messages Request ===');
        const chatId = req.params.chatId;
        console.log('Chat ID:', chatId);
        
        if (!chatId) {
            console.error('No chat ID provided');
            return res.status(400).json({ success: false, message: 'No chat ID provided' });
        }

        const correlationId = generateCorrelationId();
        console.log('Generated correlation ID:', correlationId);

        // Store the response object
        pendingResponses.set(correlationId, res);
        console.log('Stored pending response for correlation ID:', correlationId);

        // Send request to Kafka
        await producer.send({
            topic: 'fetch-chat-msg-req',
            messages: [
                {
                    key: correlationId,
                    value: JSON.stringify({
                        data: { chatId },
                        correlationId
                    })
                }
            ]
        });
        console.log('Request to kafka worker sent for chat messages');
    } catch (error) {
        console.error('Error sending chat messages request:', error);
        res.status(500).json({ success: false, message: 'Error processing request' });
    }
};

// fetch data service from kafka worker
export const fetchDataFromKafka = async()=>{
    try{
        console.log('=== Kafka Consumer Initialization START ===');
        await consumer.connect()
        console.log('Kafka consumer connected successfully');

        const topics = [
            "fetch-chats-res",
            "fetch-chat-msg-res",
            "send-message-res",
            "private-chat-res"
        ];

        console.log('Subscribing to topics:', topics);
        for (const topic of topics) {
            await consumer.subscribe({
                topic: topic,
                fromBeginning: true
            });
            console.log(`Subscribed to topic: ${topic}`);
        }

        console.log('Starting consumer run...');
        consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    console.log('=== Kafka Consumer Message Received ===');
                    console.log('Topic:', topic);
                    console.log('Partition:', partition);
                    console.log('Message key:', message.key.toString());
                    console.log('Message value:', message.value.toString());
                    
                    const parsedMessage = JSON.parse(message.value.toString());
                    console.log('Parsed message:', parsedMessage);
                    
                    const correlationId = message.key.toString();
                    console.log('Correlation ID:', correlationId);
                    
                    const pendingResponse = pendingResponses.get(correlationId);
                    console.log('Pending response found:', !!pendingResponse);
                    
                    if (!pendingResponse) {
                        console.log('No pending response found for correlation ID:', correlationId);
                        return;
                    }

                    switch (topic) {
                        case 'fetch-chats-res':
                            console.log('Processing fetch-chats-res response');
                            console.log('Response data:', parsedMessage);
                            if (parsedMessage.data) {
                                pendingResponse.json({
                                    success: true,
                                    chats: parsedMessage.data
                                });
                                console.log('Sending chat list to socket:', {
                                    success: true,
                                    chats: parsedMessage.data
                                });
                            } else {
                                console.error('No data in response:', parsedMessage);
                                pendingResponse.json({
                                    success: false,
                                    message: 'No chat data received'
                                });
                            }
                            pendingResponses.delete(correlationId);
                            console.log('Response sent and pending response deleted');
                            break;
                            
                        case 'fetch-chat-msg-res':
                            console.log('Processing fetch-chat-msg-res response');
                            console.log('Response data:', parsedMessage);
                            if (parsedMessage.data) {
                                pendingResponse.json({
                                    success: true,
                                    messages: parsedMessage.data
                                });
                            } else {
                                console.error('No data in response:', parsedMessage);
                                pendingResponse.json({
                                    success: false,
                                    message: 'No message data received'
                                });
                            }
                            pendingResponses.delete(correlationId);
                            console.log('Response sent and pending response deleted');
                            break;
                            
                        case 'private-chat-res':
                            console.log('Processing private-chat-res response');
                            console.log('Response data:', parsedMessage);
                            if (parsedMessage.data) {
                                pendingResponse.json({
                                    success: true,
                                    chat: parsedMessage.data.chat,
                                    messages: parsedMessage.data.messages
                                });
                            } else {
                                console.error('No data in response:', parsedMessage);
                                pendingResponse.json({
                                    success: false,
                                    message: 'No chat data received'
                                });
                            }
                            pendingResponses.delete(correlationId);
                            console.log('Response sent and pending response deleted');
                            break;
                            
                        default:
                            console.log('Unknown topic:', topic);
                    }
                    
                    console.log('=== Kafka Consumer Message Processing Complete ===');
                } catch (error) {
                    console.error('=== Error in Kafka Consumer ===');
                    console.error('Error details:', error);
                    console.error('=== Error in Kafka Consumer END ===');
                }
            }
        });
        console.log('=== Kafka Consumer Initialization END ===');
    }
    catch(err) {
        console.error('=== Kafka Consumer Error ===');
        console.error('Error details:', err);
        console.error('=== Kafka Consumer Error END ===');
        return {
            success: false,
            message: err.message
        }
    }
}

const getCorelationId = () => {
    return Math.floor(Math.random() * 1000000).toString()
}

const generateCorrelationId = () => {
    return uuidv4();
}