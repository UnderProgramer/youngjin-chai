import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { AuthService } from "src/user/auth/auth.service";
import { ChatService } from "./chat.service";
import { prismaClient } from "prisma/prisma.client";

@Module({
    imports:   [],
    providers: [
        ChatGateway,
        AuthService,
        ChatService,
        prismaClient
    ]
})
export class ChatModule {}