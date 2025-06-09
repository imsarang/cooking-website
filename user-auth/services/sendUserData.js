import redisClient from "../connectRedis.js"
import { pendingResponses, producer } from "../kafka.js"

export const sendUserRegisterDataToKafka = async (req, res)=>{
    await producer.connect()
    const message = {
        jsonData: req.body
    }

    const correlationId = getCorelationId()
    console.log("Email : ", message.jsonData.email);
    
    console.log(`Data sent : ${message} with correlationId: ${correlationId}`);
    
    await producer.send({
        topic: 'user-register',
        messages: [
            {
                key: correlationId,
                value: JSON.stringify({ message, correlationId }),
            }
        ]
    })
    pendingResponses.set(correlationId, res)
}

export const sendUserLoginDataToKafka = async (req,res) =>{
    await producer.connect()
    const redisKey = `user:${req.body.email}`
    // check redis cache
    const cachedData = await redisClient.get(redisKey)
    if (cachedData) {
        console.log(`Data found in redis cache : ${cachedData}`);
        res.cookie('refreshToken', JSON.parse(cachedData).refreshToken, {
            httpOnly: true,
            Path: '/',
            MaxAge: JSON.parse(cachedData).expiry
        })

        return res.status(200).json({
            success: true,
            message: "User data found in redis cache",
            data: JSON.parse(cachedData)
        })
    }

    const message = {
        jsonData: req.body
    }
    const correlationId = getCorelationId()
    await producer.send({
        topic: 'user-login',
        messages: [
            {
                key: correlationId,
                value: JSON.stringify({ message, correlationId }),
            }
        ]
    })

    pendingResponses.set(correlationId, res)
}

const getCorelationId = () => {
    return Math.floor(Math.random() * 1000000).toString()
}