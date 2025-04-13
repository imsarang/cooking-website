import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './connectDB.js'
import recipeRoutes from './routes/recipeRoutes.js'

const app = express()
dotenv.config({path: './.env'})

const port = process.env.AUTH_SERVER_PORT || 3002

//use json
app.use(express.json())


// app.use(cors({
//     origin:process.env.FRONTEND_ENDPOINT || 'http://localhost:3000',
//     methods:"GET,POST,PUT,DELETE",
//     credentials:true
// }))
app.use(cors())

//Connect to DB
connectDB()

app.use('/api/recipe',recipeRoutes)

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})
