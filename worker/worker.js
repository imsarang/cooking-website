import { runReviewConsumer } from "./consumer/recipeReviewConsumer.js";
import { runRecipeConsumer }from "./consumer/useRecipeConsumer.js";
import dotenv from 'dotenv'

// dotenv.config({ path: "./.env" });

(async ()=>{
    console.log(`Worker starting ...`);
    // await Promise.all([
    //     // dotenv.config({ path: "./.env" }),
    //     runRecipeConsumer(),
    //     runReviewConsumer()
    // ]);
    await runRecipeConsumer();
    // await fetchRecipeById
})()
