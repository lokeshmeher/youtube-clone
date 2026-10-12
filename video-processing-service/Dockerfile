FROM node:24-trixie AS base

WORKDIR /app

COPY package*.json ./

# --------------- Development ---------------
FROM base AS development

RUN apt-get update && apt-get install -y ffmpeg

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]

# --------------- Build ---------------
FROM base AS builder

RUN npm install

COPY . .

RUN npm run build

# --------------- Production ---------------
FROM base AS production

RUN apt-get update && apt-get install -y ffmpeg

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "serve"]
