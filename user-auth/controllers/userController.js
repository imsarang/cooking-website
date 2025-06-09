import User from "../models/UserSchema.js";
import { APIResponseFailure, APIResponseError, APIResponseSuccess } from "../utils/APIresponse.js";

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

export const getUsers = async (
    req,
    res
) => {
    const users = await User.find()
    return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: users,
        status: 200
    })
    // APIResponseSuccess(res, "Users fetched successfully", 200, users)
}

export const getUser = async (
    req,
    res
) => {
    const user = await User.findById(req.params.id)
    return res.status(200).json({
        success: true,
        message: "User fetched",
        user: user
    })
}