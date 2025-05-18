import { APIResponseError, APIResponseSuccess } from '../utils/APIResponse.js';
import Recipe from '../models/RecipeSchema.js'
import redisClient from '../connectRedis.js';


export const searchRecipe = async (req, res) => {
    let query = req.params.query
    // query = query.toLowerCase().replace(" ","_")
    console.log(`query for : ${query}`)
    const regex = new RegExp(query, 'i')

    const redisKey = `recipe:${query}`
    try {
        // try redis cache
        // const cacheData = await redisClient.get(redisKey)
        // if(cacheData){
        //     console.log("Cache hit")
        //     return res.status(200).json({
        //         success: true,
        //         data: JSON.parse(cacheData)
        //     })
        // }

        // if cache miss, fetch from DB
        const results = await Recipe.find({
            $or: [
                { title: regex },
                { category: regex },
            ]
        })
            .limit(10)
            .select('title category cuisine')

        console.log(results);

        if (results)
            // await redisClient.setEx(redisKey, 600, JSON.stringify(results));
            return res.status(200).json({
                success: true,
                data: results
            })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
    // check redis cache
    // if cache present, return from cache

    // if cache missing, fetch from DB
}

export const viewRecipe = async (req, res) => {
    const id = req.params.index
    try {
        const jsonData = await Recipe.findById({ _id: id })
        return res.status(200).json({
            success: true,
            data: {
                general: {
                    title: jsonData.title,
                    description: jsonData.description,
                    prepTime: jsonData.prepTime, // in minutes
                    cookTime: jsonData.cookTime, // in minutes
                    totalTime: jsonData.totalTime, // computed or manually added
                    servings: jsonData.servings,
                    cuisine: jsonData.cuisine, // e.g. "Italian", "Mexican"
                    category: jsonData.category, // e.g. "Dessert", "Main Dish"
                    difficulty: jsonData.difficulty,
                    author: jsonData.author
                },
                nutrition: {
                    calories: jsonData.calories,
                    protein: jsonData.protein,
                    carbs: jsonData.carbs,
                    fat: jsonData.fats,
                },
                ingredients: jsonData.ingredients,
                steps: jsonData.steps,
                media: {
                    image: jsonData.image,
                    video: jsonData.video
                },
                reviews: jsonData.reviews,
            }
        })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false
        })
    }

}