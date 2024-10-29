FROM node:21-alpine

ENV DATA_PATH=/data
RUN mkdir -p $DATA_PATH

# Create app directory
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src/ .

EXPOSE 3000
CMD [ "node", "main.mjs" ]
