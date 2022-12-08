FROM node:18-alpine as base

WORKDIR /app
COPY package*.json /app
EXPOSE 3000

FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY . /app/

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . /app/