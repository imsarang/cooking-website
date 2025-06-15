import express from "express";
import { connectDB } from "./connectDB.js";
import chatRoutes from "./routes/chatRoutes.js";
import {RedisMessageBucket} from "./services/redisMessageBucket.js";
import websocketService from "./services/websocketService.js";
import cors from "cors";
import http from "http";
import dotenv from "dotenv"
import { Server } from "socket.io";
import { fetchDataFromKafka } from "./services/kafkaService.js";

const app = express();
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '../.env.local' })
    console.log("Development mode")
}
else {
    dotenv.config({path: "../.env.prod"});
    console.log("Production mode")
    // RedisMessageBucket.init()
}

connectDB();

app.use(cors({
    origin: process.env.MAIN_URL || "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}))

app.use('/api/chat', chatRoutes);

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.MAIN_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    allowEIO3: true
});

// Initialize WebSocket service
websocketService.initialize(io);

server.listen(process.env.CHAT_BACKEND_PORT_1, () => {
    console.log(process.env.MONGO_DB_URI);
    console.log(`Web socket has been initialized`);
    console.log(`Chat Server is running on port ${process.env.CHAT_BACKEND_PORT_1}`);
    if(process.env.NODE_ENV === "production"){
        fetchDataFromKafka()
    }
});
