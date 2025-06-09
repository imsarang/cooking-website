import express from 'express'
import { logoutUser, getUsers, getUser } from '../controllers/userController.js'
import { refreshAccessToken, getAccessToken } from '../utils/Token.js'
import { sendUserLoginDataToKafka, sendUserRegisterDataToKafka } from '../services/sendUserData.js'
const router = express.Router()

router.route('/register').post(sendUserRegisterDataToKafka)
router.route('/login').post(sendUserLoginDataToKafka)
router.route('/refresh').get(refreshAccessToken)
router.route('/token').get(getAccessToken)
router.route('/logout').get(logoutUser)
router.route('/users').get(getUsers)
router.route('/user/:id').get(getUser)
export default router