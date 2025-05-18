import { consumer, pendingResponses } from "../kafka.js";
import redisClient from '../connectRedis.js';

export const fetchRecipeResponse = async ()=>{
    
    await consumer.connect()
    await consumer.subscribe({ topic: "recipe-response", fromBeginning: false })
    await consumer.subscribe({ topic: "recipe-idvl-response", fromBeginning: false })
    // const pendingResponses = new Map()

    consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(`Topic, Partition : ${topic} ${partition}`);
            console.log(`Message received from kafka : ${message}`);

            const msgStr = message.value.toString()
            if (!msgStr) {
                console.log(`No message received from kafka`);
                res.status(500).json({
                    success: false,
                    message: "No message received from kafka"
                })
            }

            const response = JSON.parse(message.value.toString())
            console.log(`Response from kafka : ${response}`);

            const { correlationId, status, success, log, data} = response

            console.log(correlationId, status, success, log, data);

            const res = pendingResponses.get(correlationId)
            let redisKey = ""
            switch(topic){
                case "recipe-response":
                    break;
                case "recipe-idvl-response":
                    // store in redis
                    redisKey = `recipe:${data.id}`
                    await redisClient.setEx(redisKey, 600, JSON.stringify(data))
                    break;
                default:
                    console.log("Invalid topic");
            }
            console.log(` res : ${res}`);
            
            if (res) {
                res.status(status).json({
                    success: success,
                    message: log,
                    data: data
                })
                pendingResponses.delete(correlationId)
            }
        }
    })
}

export const fetchRecipeDataFromKafka = async ()=>{
    try{
        await consumer.connect()
        await consumer.subscribe({ topic: 'recipe-idvl-response', fromBeginning: true })
        
        consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(`Topic, Partition : ${topic} ${partition}`);
                console.log(`Message received from kafka : ${message}`);

                const msgStr = message.value.toString()
                if (!msgStr) {
                    console.log(`No message received from kafka`);
                    return {
                        success: false,
                        message: "No message received from kafka"
                    }
                }

                const response = JSON.parse(message.value.toString())
                console.log(`Response from kafka : ${response}`);

                const { correlationId, status, success, log, data } = response

                console.log(correlationId, status, success, log, data);   

                // store in redis
                const redisKey = `recipe:${data.id}`
                await redisClient.setEx(redisKey, 600, JSON.stringify(data))
                const res = pendingResponses.get(correlationId)

                if (res) {
                    res.status(status).json({
                        success: success,
                        message: log,
                        data: data
                    })
                    pendingResponses.delete(correlationId)
                }
            }
        })
    }
    catch(err){
        console.log(err);
        return {
            success: false,
            message: "Internal server error"
        }
    }
}