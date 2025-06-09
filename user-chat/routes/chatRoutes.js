import express from "express";
import { storeDataInRedis, getDataFromRedis, deleteDataFromRedis, fetchChats, fetchMessages } from "../controllers/chatController.js";

const router = express.Router();

router.post('/send-message', storeDataInRedis);
router.get('/messages', getDataFromRedis);
router.delete('/messages', deleteDataFromRedis);
router.get('/chats', fetchChats);
router.get('/messages/:userId/:chatId', fetchMessages);

export default router;
