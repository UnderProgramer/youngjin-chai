import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

import { ConfigModule } from '@nestjs/config';

import { ChatModule } from './chat/chat.module';
import { MediasoupModule } from './mediasoup/mediasoup.module';

@Module({
  imports: [
    UserModule, 
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatModule,
    MediasoupModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
