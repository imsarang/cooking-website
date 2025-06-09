import jwt from 'jsonwebtoken'
import { APIResponseError, APIResponseFailure, APIResponseSuccess } from './APIresponse.js'
import User from '../models/UserSchema.js'
import redisClient from '../connectRedis.js'

export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_EXPIRE }
    )
}

export const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user?._id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.ACCESS_EXPIRE }
    )
}

export const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.cookies
    
    if (!refreshToken) {
        return APIResponseError(res, "Refresh Token not found", 401)
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
        const user = await User.findById(decoded.id)
        
        if(!user) {
            return APIResponseError(res, "User not found", 401)
        }
        
        // Generate new tokens
        const newAccessToken = generateAccessToken(user)
        const newRefreshToken = generateRefreshToken(user)

        // Set new refresh token in HTTP-only cookie
        const expiry = 7 * 24 * 60 * 60 // 7 days
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: expiry * 1000
        })

        // Store access token in Redis
        const redisKey = `user:${user._id}`
        const redisData = {
            accessToken: newAccessToken,
            user: user
        }
        await redisClient.setEx(redisKey, expiry, JSON.stringify(redisData))

        // Return only the access token to the client
        return APIResponseSuccess(res, "Token refreshed", 200, {
            success : true,
            accessToken: newAccessToken
        })

    } catch (error) {
        console.log("Token refresh error:", error);
        return APIResponseError(res, "Invalid refresh token", 401)
    }
}

export const getAccessToken = async (req, res) => {
    const { refreshToken } = req.cookies
    
    if (!refreshToken) {
        return APIResponseError(res, "Refresh Token not found", 401)
    }

    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
        console.log(`decoded User : ${decoded}`);
        
        const user = await User.findById(decoded.id)
        
        if (!user) {
            return APIResponseError(res, "User not found", 401)
        }

        // Get access token from Redis
        const redisKey = `user:${user._id}`
        const cachedData = await redisClient.get(redisKey)
        
        if (!cachedData) {
            return APIResponseError(res, "Token not found in cache", 401)
        }

        const { accessToken, data } = JSON.parse(cachedData)
        
        return APIResponseSuccess(res, "Token retrieved", 200, {
            accessToken,
            data
        })

    } catch (error) {
        console.log("Get token error:", error);
        return APIResponseError(res, "Invalid refresh token", 401)
    }
}
