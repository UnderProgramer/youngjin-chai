FROM node:22
WORKDIR /usr/src/app
COPY package*.json ./
COPY prisma ./prisma 
RUN npm install
COPY . .
RUN npm run build && ls -la /usr/src/app/dist
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
