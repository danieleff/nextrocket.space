FROM node:12 AS build

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci

COPY . /app/
RUN npm run docker-build


CMD ["node", "dist/server/server.js"]
