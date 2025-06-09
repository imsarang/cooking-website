import AWS from 'aws-sdk'
import Recipe from '../models/RecipeSchema.js'
import axios from 'axios'

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
});

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const createRecipe = async (recipeData) => {
    console.log(recipeData);

    // recipe
    const { recipe, ingredients, steps, nutrition } = recipeData.message.jsonData
    const { title, description, prepTime, cookTime, totalTime, servings, cuisine, category, difficulty, author } = JSON.parse(recipe)

    try {
        // Upload image using Lambda
        const imageFile = recipeData.message.filesData['imageFile'][0]
        const imageBase64 = Buffer.from(imageFile.buffer.data).toString('base64')
        const imageResponse = await axios.post(process.env.LAMBDA_API_URL, {
            file: `data:${imageFile.mimetype};base64,${imageBase64}`,
            fileName: `${title.toLowerCase().replace(/ /g, "-")}.${imageFile.mimetype.split('/')[1]}`,
            fileType: imageFile.mimetype,
            folder: 'image'
        })

        // Upload video using Lambda
        const videoFile = recipeData.message.filesData['videoFile'][0]
        const videoBase64 = Buffer.from(videoFile.buffer.data).toString('base64')
        const videoResponse = await axios.post(process.env.LAMBDA_API_URL, {
            file: `data:${videoFile.mimetype};base64,${videoBase64}`,
            fileName: `${Date.now()}-${videoFile.originalname}`,
            fileType: videoFile.mimetype,
            folder: 'video'
        })

        if (imageResponse.data.success && videoResponse.data.success) {
            const recipe = await Recipe.create({
                title, description, prepTime, cookTime, totalTime, servings, cuisine, category, difficulty, author,
                ingredients: JSON.parse(ingredients),
                steps: JSON.parse(steps),
                image: imageResponse.data.url,
                video: videoResponse.data.url,
                nutrition: JSON.parse(nutrition),
            })

            console.log(`Recipe Created!!!!`);

            return {
                status: 200,
                success: true,
                message: "Recipe Added to Database"
            }
        } else {
            throw new Error("Failed to upload media files")
        }
    }
    catch (err) {
        console.log(err);
        return {
            status: 500,
            success: false,
            message: "Internal Server Error, failed to store recipe in DB"
        }
    }
}

export const getRecipeById = async (recipeData) => {
    console.log(` Recipe data : ${recipeData}`);
    
    const id = recipeData.id
    try {
        const jsonData = await Recipe.findById({ _id: id })
        if (jsonData)
            return {
                status: 200,
                message: "Recipe fetched successfully",
                success: true,
                data: {
                    id: jsonData._id,
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
            }
    }
    catch (err) {
        console.log(err);
        return {
            status: 500,
            success: false,
            message: "Internal server error"
        }
    }
}

export const createRecipeReview = async (reviewData) => {
    console.log(`Review data : ${reviewData}`);
    const { recipeId, comment, rating, author } = reviewData.message.jsonData
    try {
        const recipe = await Recipe.findByIdAndUpdate(recipeId, { $push: { reviews: { comment, rating, author } } })
        if (recipe) {
            return {
                status: 200,
                success: true,
                message: "Review added successfully"
            }
        }
    }
    catch (err) {
        console.log(err);
        return {
            status: 500,
            success: false,
            message: "Internal server error"
        }
    }
}