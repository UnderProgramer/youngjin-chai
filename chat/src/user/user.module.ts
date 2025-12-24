import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { prismaClient } from 'prisma/prisma.client';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    AuthModule,
    JwtModule.registerAsync({
      imports : [ConfigModule],
      inject : [ConfigService],
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2m' }
      })
    })
  ],
  providers: [
    UserService,
    prismaClient,
    AuthService
  ],
  controllers: [UserController]
})
export class UserModule {}
