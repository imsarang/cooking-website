import User from "../models/UserSchema.js"
import bcrypt from "bcryptjs"

export const registerUser = async (userData) => {
    try {
        const { email, firstname, lastname } = userData.message.jsonData

        let { password, username } = userData.message.jsonData
        
        console.log(email, firstname, lastname, password);

        if (!username) {
            username = email.split('@')[0]
        }

        if (!email || !password) {
            return {
                status: 400,
                success: false,
                message: "Required Fields not present"
            }
        }
        //check if email already exists
        const exist = await User.findOne({ email })
        if (exist) {
            return {
                status: 400,
                success: false,
                message: "User already registered"
            }
        }
        const salt = await bcrypt.genSalt(10)
        password = await bcrypt.hash(password, salt)

        const user = await User.create(
            {
                email, password, firstname: firstname ? firstname : "", lastname: lastname ? lastname : "", username
            }
        )

        console.log("User Added Successfully");

        return {
            status: 200,
            success: true,
            message: "User Addition Success",
            data: user
        }
    }
    catch (error) {
        console.log(error);
        return {
            status: 500,
            success: false,
            message: error
        }
    }
}

export const loginUser = async (userData) => {
    try {

        const { email, password } = userData.message.jsonData

        console.log(email, password);

        if (!email || !password) {
            return {
                status: 400,
                success: false,
                message: "Required Information is empty"
            }
        }

        const existingUser = await User.findOne({ email })

        if (!existingUser) {
            return {
                status: 400,
                success: false,
                message: "User Does not exist"
            }
        }

        const passwordMatch = await bcrypt.compare(password, existingUser.password)
    
        // if (!passwordMatch) {
        //     return {
        //         status: 400,
        //         success: false,
        //         message: "Passwords Donot Match"
        //     }
        //     // APIResponseFailure(res, "Passwords Donot Match", 400);
        // }

        console.log(`User logged in with email : ${email}`);

        return {
            status: 200,
            success: true,
            message: "Login Success",
            data: existingUser
        }

    } catch (error) {
        console.log(error);
        return {
            status: 500,
            success: false,
            message: error
        }
    }
}