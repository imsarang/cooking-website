import redisClient from "../connectRedis.js";
import { consumer, pendingResponses } from "../kafka.js"
import { generateAccessToken, generateRefreshToken } from "../utils/Token.js"

export const fetchUserDataFromKafka = async () => {
    console.log(`Fetching user data from kafka ...`);

    await consumer.connect()

    await consumer.subscribe({
        topic: "auth-register-response",
        fromBeginning: true
    })

    await consumer.subscribe({
        topic: "auth-login-response",
        fromBeginning: true
    })

    // const res = pendingResponses.get(corr)
    consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const userData = JSON.parse(message.value.toString());
            // Handle the user data as needed
            const { correlationId, status, success, log, data } = userData
            const res = pendingResponses.get(correlationId)
            let refreshToken, accessToken, expiry
            let redisKey = "", redisData = {}

            switch (topic) {
                case "auth-register-response":
                    console.log(`User data from kafka : ${userData.success}`);
                    if (!res) {
                        console.log(`No response found for correlationId: ${correlationId}`);
                        return
                    }
                    // console.log(`Response found for correlationId: ${correlationId}, data: ${data}, ${data._id}`);

                    if (!success)
                        res.status(status).json({
                            success,
                            message: log,
                            data: null
                        })

                    refreshToken = generateRefreshToken(data)
                    accessToken = generateAccessToken(data)

                    // store refresh token in http-only cookie

                    expiry = 7 * 24 * 60 * 60
                    redisKey = `user:${data._id}`
                    redisData = {
                        refreshToken,
                        accessToken,
                        data
                    }

                    await redisClient.setEx(redisKey, expiry, JSON.stringify(redisData))

                    // res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${expiry};`)
                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        Path: '/',
                        MaxAge: expiry
                    })

                    res.status(status).json({
                        success,
                        log,
                        data: {
                            ...data,
                            accessToken
                        }
                    })

                    break;

                case "auth-login-response":
                    console.log(`User data from kafka : ${userData.success}`);
                    if (!res) {
                        console.log(`No response found for correlationId: ${correlationId}`);
                        return
                    }
                    // console.log(`Response found for correlationId: ${correlationId}, data: ${data}, ${data._id}`);

                    if (!success)
                        res.status(status).json({
                            success,
                            message: log,
                            data: null
                        })

                    refreshToken = generateRefreshToken(data)
                    accessToken = generateAccessToken(data)

                    // store refresh token in http-only cookie

                    expiry = 7 * 24 * 60 * 60
                    redisKey = `user:${data._id}`
                    redisData = {
                        refreshToken,
                        accessToken,
                        data
                    }

                    await redisClient.setEx(redisKey, expiry, JSON.stringify(redisData))
                    // res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${expiry};`)
                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        Path: '/',
                        MaxAge: expiry
                    })

                    res.status(status).json({
                        success,
                        log,
                        data: {
                            ...data,
                            accessToken
                        }
                    })

                    break;
                default:
                    console.log(`No matching topic found for ${topic}`);
                    break;
            }
        }
    })
}