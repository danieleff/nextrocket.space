FROM node:25-slim AS build

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci

COPY . /app/
RUN npm run build


# Runtime image: only production dependencies and the built output.
FROM node:25-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json /app/
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist /app/dist
COPY --from=build /app/public /app/public

USER node
EXPOSE 3000
CMD ["node", "dist/server/server.js"]
