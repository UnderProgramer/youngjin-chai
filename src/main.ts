import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    app.enableCors({
        origin: '*',
        credentials: true,
    });

    const config = new DocumentBuilder()
        .setTitle('youngjin-chat')
        .setDescription(
            `[ younjin-chat api docs ]
             [ users ] : login, register, findUser, email service
             [ rooms ] : create room, list public rooms, room detail`,
        )
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Access token',
            },
            'access-token',
        )
        .addCookieAuth('refresh_token')
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    await app.listen(process.env.PORT ?? 3333, "0.0.0.0");
}

bootstrap();
