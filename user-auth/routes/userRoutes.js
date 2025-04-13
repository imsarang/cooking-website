import express from 'express'
import { registerUser, loginUser, logoutUser } from '../controllers/userController.js'
import { refreshAccessToken } from '../utils/Token.js'
const router = express.Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logoutUser)
router.route('/refresh').get(refreshAccessToken)
export default router