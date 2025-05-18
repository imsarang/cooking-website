import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './connectDB.js'
import recipeRoutes from './routes/recipeRoutes.js'
import redisClient from './connectRedis.js'
import { fetchRecipeResponse } from './services/fetchDataService.js'

const app = express()

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '../.env.local' })
    console.log("Development mode")
}
else {
    console.log("Production mode")
}

const port = process.env.AUTH_SERVER_PORT || 3002

//use json
app.use(express.json())


app.use(cors({
    origin: process.env.FRONTEND_ENDPOINT || 'http://localhost:3000',
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}))
// app.use(cors())

//Connect to DB
connectDB()

// connect to redis
if (process.env.NODE_ENV === 'production') {
    await redisClient.connect();
    redisClient.on('connect', () => {
        console.log('Redis client connected');
    });
}

app.use('/api/recipe', recipeRoutes)

// listen to kafka worker
app.listen(port, () => {
    if (process.env.NODE_ENV === 'production') {
        fetchRecipeResponse()
    }

    console.log(`Server is running on port ${port}`)
})
