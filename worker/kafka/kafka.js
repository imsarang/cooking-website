import {Kafka, Partitioners} from 'kafkajs';

const kafkaClient = new Kafka({
    clientId: 'recipe-worker',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
    createPartitioner: Partitioners.LegacyPartitioner,
    maxRequestSize: 200000000 , // allow bigger response payloads
})

export const producer = kafkaClient.producer();
export const recipeConsumer = kafkaClient.consumer({
    groupId: 'recipe-worker-group',
    maxRequestSize: 200000000 
});

export const recipeReviewConsumer = kafkaClient.consumer({
    groupId: 'recipe-review-worker-group',
    maxRequestSize: 200000000 
});