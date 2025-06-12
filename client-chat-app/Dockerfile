FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

COPY .env.docker .env

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]