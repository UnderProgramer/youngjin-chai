import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { AuthService } from "src/user/auth/auth.service";
import { ChatService } from "./chat.service";
import { prismaClient } from "prisma/prisma.client";
import { UserService } from "src/user/user.service";

@Module({
    imports:   [],
    providers: [
        ChatGateway,
        AuthService,
        ChatService,
        prismaClient,
        UserService,
    ]
})
export class ChatModule {}