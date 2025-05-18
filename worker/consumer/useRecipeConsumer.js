import mongoose, { get } from "mongoose";
import dotenv from "dotenv";
import { recipeConsumer, producer } from "../kafka/kafka.js";
import { createRecipe, getRecipeById } from "../controller/recipeController.js";

dotenv.config({ path: "./.env" });

export const runRecipeConsumer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log(`Worker connected to MongoDB`);

        await recipeConsumer.connect();
        await recipeConsumer.subscribe({ topic: "create-recipe", fromBeginning: true });
        await recipeConsumer.subscribe({ topic: 'request-recipe', fromBeginning: true })

        await producer.connect()

        await recipeConsumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const recipeData = JSON.parse(message.value.toString());
                let kafkaResult = null;
                switch (topic) {
                    case "create-recipe":
                        console.log(`Topic, Partition : ${topic} ${partition}`);
                        const result = await createRecipe(recipeData);

                        console.log(`Result from recipe creation : ${result}`);

                        kafkaResult = await producer.send({
                            topic: "recipe-response",
                            messages: [
                                {
                                    key: recipeData.correlationId,
                                    value: JSON.stringify({
                                        correlationId: recipeData.correlationId,
                                        status: result.status,
                                        success: result.success,
                                        log: result.message,
                                    }),
                                },
                            ],
                        });
                        break;
                        
                    case "request-recipe":
                        console.log(`Topic, Partition : ${topic} ${partition}`);
                        console.log(` RecipeData : ${recipeData}`);
                        
                        // const recipeId = recipeData.recipeId;
                        const recipeResult = await getRecipeById(recipeData);

                        console.log(`Result from recipe creation : ${recipeResult}`);

                        kafkaResult = await producer.send({
                            topic: "recipe-idvl-response",
                            messages: [
                                {
                                    key: recipeData.correlationId,
                                    value: JSON.stringify({
                                        correlationId: recipeData.correlationId,
                                        status: recipeResult.status,
                                        success: recipeResult.success,
                                        log: recipeResult.message,
                                        data: recipeResult.data
                                    }),
                                },
                            ],
                        });
                        break;
                    default:
                        console.log(`Unknown topic: ${topic}`);
                        break;
                }

                if (kafkaResult)
                    console.log(`Result from kafka producer : ${kafkaResult}`);
                else
                    console.log(`No result from kafka producer`);
            },
        })
    } catch (err) {
        console.log(err);
    }
}

// export const fetchRecipeById = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_DB_URI);
//         console.log(`Worker connected to MongoDB`);

//         await producer.connect()
//         await recipeConsumer.connect();
//         await recipeConsumer.subscribe({ topic: 'request-recipe', fromBeginning: true })
//         await recipeConsumer.run({
//             eachMessage: async ({ topic, partition, message }) => {
//                 const recipeData = JSON.parse(message.value.toString());
//                 const result = await getRecipeById(recipeData);

//                 console.log(`Result from recipe creation : ${result}`);

//                 const kafkaResult = await producer.send({
//                     topic: "recipe-idvl-response",
//                     messages: [
//                         {
//                             key: recipeData.correlationId,
//                             value: JSON.stringify({
//                                 correlationId: recipeData.correlationId,
//                                 status: result.status,
//                                 success: result.success,
//                                 log: result.message,
//                                 data: result.data
//                             }),
//                         },
//                     ],
//                 });

//                 if (kafkaResult)
//                     console.log(`Result from kafka producer : ${kafkaResult}`);
//                 else
//                     console.log(`No result from kafka producer`);
//             },
//         })
//     }
//     catch (err) {
//         console.log();
//     }
// }