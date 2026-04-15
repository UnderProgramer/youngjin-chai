FROM node:22

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma 
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
EXPOSE 10000-14999/udp

CMD ["node", "dist/src/main.js"]
