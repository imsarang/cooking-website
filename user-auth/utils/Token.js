import jwt from 'jsonwebtoken'
import { APIResponseError, APIResponseFailure, APIResponseSuccess } from './APIresponse.js'
import User from '../models/UserSchema.js'

export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_EXPIRE }
    )
}

export const generateAccessToken = (user) => {

    console.log(`Access token for user : ${user._id}`);
    console.log(process.env.JWT_ACCESS_SECRET);
    
    
    return jwt.sign(
        { id: user?._id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.ACCESS_EXPIRE }
    )
}

export const refreshAccessToken = async (
    req,
    res
) => {
    const { refreshToken } = req.cookies
    console.log(refreshToken);
    
    if (!refreshToken) {
        APIResponseError(res, "Refresh Token not found", 500)
    }

    try {
        const decoded = jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET)
        const user = await User.findById(decoded.id)
        
        if(!user)
        {
            APIResponseError(res,"User not found",400)
        }
        
        const newAccessToken = generateAccessToken(user)

        const data = {
            user:user,
            accessToken:newAccessToken
        }

        APIResponseSuccess(res,"Token generated",200,data)

    } catch (error) {
        console.log(error);
        
        APIResponseError(res, error, 500)
    }
}

export const authToken = (handler)=>{
    return async (
        req,
        res
    )=>{
        
        console.log(req.headers['authorization']);
        
        let token = req.headers['authorization']
        token = token?.split(' ')[1]
        
        try{
            const decoded = jwt.verify(token,process.env.JWT_ACCESS_SECRET)
            req.user = await User.findById(decoded.id).select('-password')
            if(!req.user)
            {
                APIResponseFailure(res,"User not logged in",401)
            }
            handler(req,res)
        }
        catch(error){
            if(error?.name == "TokenExpiredError")
            {
                APIResponseFailure(res,"Token has expired",401)
            }
            APIResponseError(res,error,500)
        }
    }
}