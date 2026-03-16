## Description
Nestjs와 mediasoup, socket을 이용한 실시간 채팅 및 화면 공유 서비스

## Tech Stack

Backend
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-010101?style=flat-square&logo=prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

RealTime
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socketdotio&logoColor=white)

## Architecture

![architecture](./architecture/architecture.drawio.png)

## Features

- WebRTC media streaming using mediasoup
- WebRTC screen share using mediasoup
- SFU architecture for scalable real-time communication
- WebSocket signaling server built with NestJS
- Room-based media session management
- Dynamic WebRtcTransport creation and management
- Producer / Consumer media pipeline
- Peer state management using in-memory store
- JWT-based authentication for socket connections

## Installation

```bash
# clone repository
git clone https://github.com/UnderProgramer/youngjin-chai.git

# move directory
cd chat

# install dependencies
npm install
```
## Run

```bash
# development
npm run start:dev

# production
npm run start
```