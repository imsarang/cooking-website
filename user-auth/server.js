import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes.js"
import connectDB from './db/connectDB.js'
import { fetchUserDataFromKafka } from "./services/fetchUserData.js"
import redisClient from "./connectRedis.js"

const app = express()

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '../.env.local' })
    console.log("Development mode")
}
else {
    console.log("Production mode")
}

const port = process.env.AUTH_SERVER_PORT || 3001

// use json
app.use(express.json())

//cookie
app.use(cookieParser())

if (process.env.NODE_ENV === 'production') {
    await redisClient.connect();
    redisClient.on('connect', () => {
        console.log('Redis client connected');
    });
}

//cors
app.use(cors({
    origin: process.env.FRONTEND_ENDPOINT || "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}))

//connect to database
connectDB()

app.use('/api/auth', userRoutes)

//open and listen to the port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    if (process.env.NODE_ENV === 'production') {
        fetchUserDataFromKafka()
    }
    // if (process.env.NODE_ENV === 'production') {
    //     // async () => {
    //     //     await Promise.all([
    //     //         // dotenv.config({ path: "./.env" }),
    //     //         fetchUserDataFromKafka()
    //     //     ]);
    //     // }
    //     async () => {
    //         try {
    //             await fetchUserDataFromKafka()
    //         }
    //         catch (err) {
    //             console.log(err);
    //         }
    //     }
    // }
})