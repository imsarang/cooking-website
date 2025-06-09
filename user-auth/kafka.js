import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'backend-auth',
    brokers: ['kafka:9092'],
    connectionTimeout: 3000,
    authenticationTimeout: 1000,
    reauthenticationThreshold: 1000,
    retry:{ 
        initialRetryTime: 500,
        retries: 10,
    },
    maxRequestSize: 200000000 , // allow bigger response payloads
})

export const producer = kafka.producer()
export const consumer = kafka.consumer({
    groupId: 'user-auth-group',
    maxRequestSize: 200000000
})

export const pendingResponses = new Map()