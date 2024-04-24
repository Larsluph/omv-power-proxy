FROM node:21-alpine

ENV DATA_PATH=/data

# Create app directory
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src/ .

EXPOSE 3000
CMD [ "node", "server.mjs" ]
