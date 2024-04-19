FROM node:21-alpine

# Create app directory
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD [ "node", "server.mjs" ]
