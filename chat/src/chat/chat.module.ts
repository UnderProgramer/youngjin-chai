import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { AuthService } from "src/user/auth/auth.service";
import { ChatService } from "./chat.service";
import { prismaClient } from "prisma/prisma.client";
import { ChatController } from "./chat.controller";

@Module({
    imports:   [],
    controllers:[
        ChatController
    ],
    providers: [
        ChatGateway,
        AuthService,
        ChatService,
        prismaClient
    ]
})
export class ChatModule {}