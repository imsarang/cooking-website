import express from "express";
import { storeDataInRedis, getDataFromRedis, deleteDataFromRedis, fetchChats, fetchMessages } from "../controllers/chatController.js";
import { sendReqForChatMessages, sendReqForPrivateChat, sendReqForUserChats } from "../services/kafkaService.js";

const router = express.Router();

router.post('/send-message', storeDataInRedis);
router.get('/messages/:chatID', sendReqForChatMessages);
router.delete('/messages', deleteDataFromRedis);
router.get('/chats/:userId', sendReqForUserChats);
router.get('/messages/:userId/:chatId', fetchMessages);
router.get('/private/:user1/:user2', sendReqForPrivateChat);
export default router;
