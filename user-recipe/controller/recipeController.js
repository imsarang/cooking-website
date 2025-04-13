import { APIResponseError, APIResponseSuccess } from '../utils/APIResponse.js';
import Recipe from '../models/RecipeSchema.js'

import AWS from 'aws-sdk'

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const createRecipe = async (
    req,
    res
) => {

    console.log(req.body);

    // image
    const imageFile = req.files['imageFile'][0]
    const imageFileKey = `image/${Date.now()}-${imageFile.originalname}`
    // console.log(req.file);
    // console.log(req.body.title);


    const ImageParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: imageFileKey,
        Body: imageFile.buffer,
        ContentType: imageFile.mimetype,
    }

    // video
    const videoFile = req.files['videoFile'][0]
    const videoFileKey = `video/${Date.now()}-${videoFile.originalname}`
    // console.log(videoFile);

    const VideoParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: videoFileKey,
        Body: videoFile.buffer,
        ContentType: videoFile.mimetype
    }
    
    // recipe
    const { recipe, ingredients, steps } = req.body

    const { title, description, prepTime, cookTime, totalTime, servings, cuisine, category, difficulty, author } = JSON.parse(recipe)
    
    try {
        const ImageData = await s3.upload(ImageParams).promise();
        const VideoData = await s3.upload(VideoParams).promise();

        const recipe = await Recipe.create(
            {
                title, description, prepTime, cookTime, totalTime, servings, cuisine, category, difficulty, author, 
                ingredients: JSON.parse(ingredients),
                steps: JSON.parse(steps),
                image: ImageData.Location,
                video: VideoData.Location
            }
        )

        // APIResponseSuccess(res, "Recipe Added to DB", 200, recipe)
        res.status(200).json({
            success: true,
            message: "Recipe Added to Database"
        })
    }
    catch (err) {
        console.log(err);
        APIResponseError(req, err, 500)
    }

}
