import { producer, pendingResponses } from "../kafka.js";
import { CompressionTypes } from "kafkajs";
import redisClient from '../connectRedis.js';

export const sendRecipeDataToKafka = async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.files);

        const message = {
            jsonData: req.body,
            filesData: req.files
        }

        const correlationId = getCorelationId();

        pendingResponses.set(correlationId, res)
        await producer.connect()
        await producer.send({
            topic: 'create-recipe',
            messages: [
                {
                    key: correlationId,
                    value: JSON.stringify({ message, correlationId }),
                    compression: CompressionTypes.GZIP,
                }
            ]
        })
    } catch (err) {
        console.log(err);
    }
}

export const sendReviewDataToKafka = async (req, res) => {
    console.log(`Review : ${req.body}`);
    
    const message = {
        jsonData: req.body,
    }
    const correlationId = getCorelationId();
    pendingResponses.set(correlationId, res)
    await producer.connect()
    await producer.send({
        topic: 'recipe-review',
        messages: [
            {
                key: correlationId,
                value: JSON.stringify({ message, correlationId }),
                compression: CompressionTypes.GZIP,
            }
        ]
    })
}

export const getRecipeDataFromKafka = async (req, res) => {
    const correlationId = getCorelationId()
    try {

        // redis cache hit
        const redisKey = `recipe:${req.params.index}`
        const cacheData = await redisClient.get(redisKey)
        if(cacheData){
            console.log("Cache hit")
            return res.status(200).json({
                success: true,
                data: JSON.parse(cacheData)
            })
        }

        // redic cache miss 
        await producer.connect()

        console.log(`Requesting recipe data from kafka for id : ${req.params.index}`);
        pendingResponses.set(correlationId, res)
        await producer.send({
            topic: "request-recipe",
            messages: [
                {
                    key: correlationId,
                    value: JSON.stringify({ id: req.params.index, correlationId }),
                    compression: CompressionTypes.GZIP,
                }
            ]
        })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


const getCorelationId = () => {
    return Math.floor(Math.random() * 1000000).toString()
}