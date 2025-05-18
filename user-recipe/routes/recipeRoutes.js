import express from 'express'
import { searchRecipe, viewRecipe } from '../controller/recipeController.js'
import { checkAuth, checkImage} from '../middleware/checks.js'
import { sendRecipeDataToKafka, sendReviewDataToKafka, getRecipeDataFromKafka } from '../services/recipeService.js'

const router = express.Router()

router.route('/create').post(checkAuth, checkImage, sendRecipeDataToKafka)
router.route('/search/:query').get(searchRecipe)
router.route('/view/:index').get(getRecipeDataFromKafka)
router.route('/add-review/:index').post(checkAuth, sendReviewDataToKafka)
router.route('/test').get((req, res) => {
    res.status(200).json({
        success: true,
        message: "Test route"
    })
})

export default router