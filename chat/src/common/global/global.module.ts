import { Global, Module } from "@nestjs/common";
import { DiscordService } from "./discord.service";
import { EmailService } from "./email.service";
import { GlobalExceptionHandler } from "./exception/http-exception.filter";

@Global()
@Module({
    providers: [
        DiscordService,
        EmailService,
        GlobalExceptionHandler
    ],
    
})

export class GlobalModule{}
