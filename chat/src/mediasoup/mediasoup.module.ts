import { Module } from "@nestjs/common";
import { MediasoupService } from "./mediasoup.service";
import { MediasoupGateway } from "./mediasoup.gateway";
import { TransportService } from "./transport/transport.service";
import { AuthService } from "src/user/auth/auth.service";
import { prismaClient } from "prisma/prisma.client";

@Module(
    {
        providers: [
            MediasoupService,
            MediasoupGateway,
            TransportService,
            AuthService,
            prismaClient
        ]
    }
)
export class MediasoupModule {}