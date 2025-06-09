import dotenv from "dotenv";
import { producer, userConsumer } from "../kafka/kafka.js";
import { loginUser, registerUser } from "../controller/userController.js";
import mongoose from "mongoose";

dotenv.config({ path: "./.env" });

export const runUserConsumer = async ()=>{
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log(`Worker connected to MongoDB in userConsumer`);

    await userConsumer.connect()
    await userConsumer.subscribe({
        topic: 'user-register',
        fromBeginning: true
    })

    await userConsumer.subscribe({
        topic: 'user-login',
        fromBeginning: true
    })

    await producer.connect()
    await userConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const userData = JSON.parse(message.value.toString());
            console.log(`User data from kafka : ${userData}`);
            let kafkaResult
            switch(topic){
                case 'user-register':
                    const registerResult = await registerUser(userData)
                    console.log(`Result from user register : ${registerResult.status} ${registerResult.message}`);
                    
                    kafkaResult = await producer.send({
                        topic: "auth-register-response",
                        messages: [
                            {
                                key: userData.correlationId,
                                value: JSON.stringify({
                                    correlationId: userData.correlationId,
                                    status: registerResult.status,
                                    success: registerResult.success,
                                    log: registerResult.message,
                                    data: registerResult.data
                                }),
                            }
                        ]
                    })
                    break;
                case 'user-login':
                    const loginResult = await loginUser(userData)
                    console.log(`Result from user login : ${loginResult.status} ${loginResult.message}`);
                    
                    kafkaResult = await producer.send({
                        topic: 'auth-login-response',
                        messages: [
                            {
                                key: userData.correlationId,
                                value: JSON.stringify({
                                    correlationId: userData.correlationId,
                                    status: loginResult.status,
                                    success: loginResult.success,
                                    log: loginResult.message,
                                    data: loginResult.data
                                }),
                            }
                        ]
                    })
                    break;
                default:
                    console.log(`No matching topic found for ${topic}`);
                    break;
            }  
            if(kafkaResult)
                console.log(`Result from kafka producer : ${kafkaResult}`);
            else
                console.log(`No result from kafka producer`); 
        }
    })
}