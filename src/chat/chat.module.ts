import { Module } from "@nestjs/common";
import { prismaClient } from "prisma/prisma.client";
import { AuthService } from "src/user/auth/auth.service";
import { UserManager } from "src/user/user.manager";
import { UserRepository } from "src/user/user.repository";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { ChatManager } from "./chat.manager";
import { ChatRepository } from "./chat.repository";
import { ChatService } from "./chat.service";

@Module({
    imports: [],
    controllers: [ChatController],
    providers: [
        ChatGateway,
        AuthService,
        ChatService,
        ChatRepository,
        ChatManager,
        UserRepository,
        UserManager,
        prismaClient,
    ],
})
export class ChatModule {}
