import AWS from 'aws-sdk'
import Recipe from '../models/RecipeSchema.js'

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

    console.log(`AWS ACCESS KEY : ${process.env.AWS_ACCESS_KEY_ID}`);


    s3.listBuckets((err, data) => {
        if (err) {
            console.error("S3 auth failed:", err);
        } else {
            console.log("S3 is authenticated ✅ - Buckets:", data.Buckets);
        }
    });

    // console.log(req.body);

    // recipe
    const { recipe, ingredients, steps, nutrition } = recipeData.message.jsonData

    const { title, description, prepTime, cookTime, totalTime, servings, cuisine, category, difficulty, author } = JSON.parse(recipe)

    // image
    const imageFile = recipeData.message.filesData['imageFile'][0]
    const imageName = title.lower().replace(/ /g, "-")
    const imageFileKey = `image/${imageName}`

    console.log(imageFile);

    console.log(`Image file key : ${imageFileKey}`);
    console.log(`Image buffer type : ${typeof (imageFile.buffer)}`);


    const ImageParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: imageFileKey,
        Body: Buffer.from(imageFile.buffer.data),
        ContentType: imageFile.mimetype,
    }

    console.log(`Image Params : ${ImageParams}`);

    // video
    const videoFile = recipeData.message.filesData['videoFile'][0]
    const videoFileKey = `video/${Date.now()}-${videoFile.originalname}`
    console.log(videoFile);

    const VideoParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: videoFileKey,
        Body: Buffer.from(videoFile.buffer.data),
        ContentType: videoFile.mimetype
    }

    try {
        const ImageData = await s3.upload(ImageParams).promise();
        const VideoData = await s3.upload(VideoParams).promise();

        if (ImageData && VideoData) {
            const recipe = await Recipe.create(
                {
                    title, description, prepTime, cookTime, totalTime, servings, cuisine, category, difficulty, author,
                    ingredients: JSON.parse(ingredients),
                    steps: JSON.parse(steps),
                    image: ImageData.Location,
                    video: VideoData.Location,
                    nutrition: JSON.parse(nutrition),
                }
            )
        }

        console.log(`Recipe Created!!!!`);

        // APIResponseSuccess(res, "Recipe Added to DB", 200, recipe)
        return {
            status: 200,
            success: true,
            message: "Recipe Added to Database"
        }
    }
    catch (err) {
        console.log(err);
        return {
            status: 500,
            success: false,
            message: "Internal Server Error , failed to store recipe in DB"
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