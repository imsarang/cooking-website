import Recipe from '../models/RecipeSchema.js'

export const addReview = async (reviewData) => {
    // logic to add review to the database
    const { recipeId, userId, rating, comment} = reviewData;
    
    try{
        const recipe = await Recipe.updateOne(
            {_id: recipeId},
            {
                $push:{
                    reviews:{
                        userId: userId,
                        rating: rating,
                        comment: comment,
                    }
                }
            }
        )

        return {
            success: true,
            status: 200,
            message: "Review added successfully",
        }
        
    }catch(err){
        console.log(err);
        return {
            success: false,
            status: 500,
        }
    }
}