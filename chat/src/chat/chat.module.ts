import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { AuthService } from "src/user/auth/auth.service";

@Module({
    imports:   [],
    providers: [ChatGateway, AuthService]
})
export class ChatModule {}