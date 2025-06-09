import { Kafka, Partitioners } from 'kafkajs';

const kafkaClient = new Kafka({
    clientId: 'kafka-worker',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
    createPartitioner: Partitioners.LegacyPartitioner,
    maxRequestSize: 200000000, // allow bigger response payloads
})

export const producer = kafkaClient.producer();

// consumers
export const recipeConsumer = kafkaClient.consumer({
    groupId: 'recipe-worker-group',
    maxRequestSize: 200000000
});

export const recipeReviewConsumer = kafkaClient.consumer({
    groupId: 'recipe-review-worker-group',
    maxRequestSize: 200000000
});

export const userConsumer = kafkaClient.consumer({
    groupId: 'user-worker-group',
    maxRequestSize: 200000000
})

const requiredTopics = [
    {
        topic: 'user-register',
        numPartitions: 2,
        replicationFactor: 1
    },
    {
        topic: 'user-login',
        numPartitions: 2,
        replicationFactor: 1
    },
    {
        topic: 'create-recipe',
        numPartitions: 2,
        replicationFactor: 1
    },
    {
        topic: "recipe-response",
        numPartitions: 2,
        replicationFactor: 1
    },
    {
        topic: 'recipe-review',
        numPartitions: 2,
        replicationFactor: 1
    },
    {
        topic: "request-recipe",
        numPartitions: 2,
        replicationFactor: 1
    },
    {
        topic: 'auth-register-response',
        numPartitions: 2,
        replicationFactor: 1
    },
    {
        topic: 'auth-login-response',
        numPartitions: 2,
        replicationFactor: 1
    },
    {
        topic: "recipe-review-response",
        numPartitions: 2,
        replicationFactor: 1
    },
    {
        topic: "recipe-idvl-response",
        numPartitions: 2,
        replicationFactor: 1
    }
]

// create topics
export const createKafkaTopics = async () => {
    const admin = kafkaClient.admin()
    try {
        await admin.connect()
        console.log(`Kafka admin connected`);

        const existingTopics = await admin.listTopics();
        const topicsToCreate = requiredTopics.filter(topic => !existingTopics.includes(topic.topic));

        if (topicsToCreate.length === 0) {
            console.log(`All topics already exist`);
        }

        else {

            await admin.createTopics({
                topics: topicsToCreate,
                waitForLeaders: true,
            })

            console.log(`Topics in kafka : ${existingTopics}`);

            console.log(`Topics created: ${topicsToCreate.map(topic => topic.topic).join(', ')}`);
        }

    }
    catch (err) {
        console.log(err);
    }
}

