import { mongo } from "mongoose";
import { producer, recipeReviewConsumer } from "../kafka/kafka.js";

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export const runReviewConsumer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log(`Worker connected to MongoDB`);
        await recipeReviewConsumer.connect();
        await recipeReviewConsumer.subscribe(
            {
                topic: "recipe-review",
                fromBeginning: true
            }
        )

        await producer.connect()

        await recipeReviewConsumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const reviewData = JSON.parse(message.value.toString());
                let kafkaResult = null;
                switch (topic) {
                    case "recipe-review":
                        const result = await createRecipeReview(reviewData);
                        console.log(`Result from recipe review creation : ${result}`);
                        kafkaResult = await producer.send({
                            topic: "recipe-review-response",
                            messages: [
                                {
                                    key: reviewData.correlationId,
                                    value: JSON.stringify({
                                        correlationId: reviewData.correlationId,
                                        status: result.status,
                                        success: result.success,
                                        log: result.message,
                                    }),
                                },
                            ],
                        })
                    break;
                    default:
                        console.log(`Unknown topic: ${topic} for review`);
                        break;
                }
                if (kafkaResult)
                    console.log(`Result from kafka producer : ${kafkaResult}`);
                else
                    console.log(`No result from kafka producer`);
            }
        })
    }
    catch (err) {
        console.log(err);
    }
}