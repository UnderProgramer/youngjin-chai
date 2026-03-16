import { Global, Module } from "@nestjs/common";
import { DiscordService } from "./discord.service";
import { EmailService } from "./email.service";
import { GlobalExceptionFilter } from "./exception/global-exception.filter";

@Global()
@Module({
    providers: [
        DiscordService,
        EmailService,
        GlobalExceptionFilter
    ],
    exports: [
        DiscordService,
        EmailService,
        GlobalExceptionFilter
    ]

})

export class GlobalModule{}
