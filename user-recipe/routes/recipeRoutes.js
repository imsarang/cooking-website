import express from 'express'
import { createRecipe } from '../controller/recipeController.js'
import { checkAuth, checkImage} from '../middleware/checks.js'

const router = express.Router()

router.route('/create').post(checkAuth, checkImage, createRecipe)

export default router