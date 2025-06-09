import { runReviewConsumer } from "./consumer/recipeReviewConsumer.js";
import { runUserConsumer } from "./consumer/userConsumer.js";
import { runRecipeConsumer }from "./consumer/useRecipeConsumer.js";
import dotenv from 'dotenv'
import { createKafkaTopics } from "./kafka/kafka.js";

dotenv.config({ path: "./.env" });

(async ()=>{
    console.log(`Worker starting ...`);
    await Promise.all([
        // dotenv.config({ path: "./.env" }),
        createKafkaTopics(),
        runUserConsumer(),
        runRecipeConsumer(),
        runReviewConsumer()
    ]);
    // await runRecipeConsumer();
    // await fetchRecipeById
})()
