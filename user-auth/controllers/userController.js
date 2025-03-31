import { APIResponseFailure, APIResponseError, APIResponseSuccess } from "../utils/APIresponse.js";
import { generateAccessToken, generateRefreshToken } from "../utils/Token.js";
import bcrypt from "bcryptjs"
import cookieParser from "cookie-parser";
import User from "../models/UserSchema.js";

export const registerUser = async (
    req ,
    res 
) => {

    try {
        const { email, firstname, lastname} = req.body
        let {password, username} = req.body
        if(!username){
            username = email.split('@')[0]
        }
        
        if (!email || !password) {
            APIResponseFailure(res, "Required Fields not present", 400)
        }
        //check if email already exists
        const exist = await User.findOne({ email })
        if (exist) {
            APIResponseFailure(res, "User already registered", 400)
        }

        const salt = await bcrypt.genSalt(10)
        password = await bcrypt.hash(password, salt)

        const user = await User.create(
            {
                email, password, firstname, lastname, username
            }
        )

        //generate refresh token
        const refreshToken = generateRefreshToken(user)
        const accessToken = generateAccessToken(user)

        // store refresh token in http-only cookie

        const expiry = 7 * 24 * 60 * 60

        // res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${expiry};`)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, 
            Path: '/',
            MaxAge: expiry 
        })

        const data = {
            user: user,
            accessToken: accessToken
        }

        console.log("User Added Successfully");
        
        APIResponseSuccess(res, "User Addition Success", 200, data)
    }
    catch (error) {
        console.log(error);

        APIResponseError(res, error, 500)
    }
}

export const loginUser = async (
    req,
    res
) => {
    
    try {
        const { email, password } = req.body;
        
        console.log(email, password);
        
        if (!email || !password) {
            APIResponseFailure(res, "Required Information is empty", 400)
        }

        const existingUser = await User.findOne({ email })

        if (!existingUser) {
            APIResponseFailure(res, "User Does not exist", 400)
        }

        const passwordMatch = await bcrypt.compare(password, existingUser.password)
        
        if (!passwordMatch) {
            APIResponseFailure(res, "Passwords Donot Match", 400);
        }

        const accessToken = generateAccessToken(existingUser)
        const refreshToken = generateRefreshToken(existingUser)

        const expiry = 7 * 24 * 60 * 60

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            Path: '/',
            MaxAge: expiry  
        })

        const data = {
            user: existingUser,
            accessToken: accessToken
        }

        console.log(`User logged in with email : ${email}`);
        APIResponseSuccess(res, "Login success", 200, data)

    } catch (error) {
        console.log(error);
        APIResponseError(res, error, 500);
    }
}

export const logoutUser = async (
    req,
    res
) => {
    
    if(req.cookies.refreshToken){
        res.clearCookie('refreshToken')
    }
    // res.clearCookie('refreshToken')
    console.log(`User logged out`);
    APIResponseSuccess(res, "Logout Success", 200, {})
}
