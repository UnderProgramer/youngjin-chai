import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscordService } from '../common/global/discord.service';
import { EmailService } from '../common/global/email.service';
import { prismaClient } from '../../prisma/prisma.client';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { UserController } from './user.controller';
import { UserManager } from './user.manager';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
    imports: [
        AuthModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            global: true,
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '2m' },
            }),
        }),
    ],
    providers: [
        UserService,
        prismaClient,
        AuthService,
        EmailService,
        DiscordService,
        UserRepository,
        UserManager,
    ],
    controllers: [UserController],
})
export class UserModule {}
