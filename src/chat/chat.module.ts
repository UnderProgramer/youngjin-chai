import { Module } from "@nestjs/common";
import { prismaClient } from "../../prisma/prisma.client";
import { AuthService } from "../user/auth/auth.service";
import { EmailVerifiedGuard } from "../user/auth/email-verified.guard";
import { UserManager } from "../user/user.manager";
import { UserRepository } from "../user/user.repository";
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
        EmailVerifiedGuard,
        prismaClient,
    ],
})
export class ChatModule {}
