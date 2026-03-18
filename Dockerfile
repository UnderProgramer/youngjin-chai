FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
