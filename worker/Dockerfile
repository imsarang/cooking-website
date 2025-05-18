FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add curl
RUN apk add --no-cache bash

RUN npm install

COPY . .

RUN apk add --no-cache curl && \
    apk add --no-cache bash

RUN curl -O https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh && \
    mv wait-for-it.sh /usr/local/bin/wait-for-it.sh && \
    chmod +x /usr/local/bin/wait-for-it.sh
