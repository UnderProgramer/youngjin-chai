import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

import { ConfigModule } from '@nestjs/config';

import { ChatModule } from './chat/chat.module';
import { MediasoupModule } from './mediasoup/mediasoup.module';
import { GlobalModule } from './common/global/global.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/global/exception/global-exception.filter';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    UserModule,
    ChatModule,
    MediasoupModule,
    GlobalModule,
    
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide : APP_FILTER,
      useClass : GlobalExceptionFilter,
    }
  ],
})
export class AppModule {}
