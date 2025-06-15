import { runReviewConsumer } from "./consumer/recipeReviewConsumer.js";
import { runUserConsumer } from "./consumer/userConsumer.js";
import { runRecipeConsumer }from "./consumer/useRecipeConsumer.js";
import dotenv from 'dotenv'
import { createKafkaTopics } from "./kafka/kafka.js";
import { runChatConsumer } from "./consumer/chatConsumer.js";

dotenv.config({ path: "./.env" });

(async ()=>{
    console.log(`Worker starting ...`);
    await Promise.all([
        // dotenv.config({ path: "./.env" }),
        createKafkaTopics(),
        runUserConsumer(),
        runRecipeConsumer(),
        runReviewConsumer(),
        runChatConsumer()
    ]);
    // await runRecipeConsumer();
    // await fetchRecipeById
})()
