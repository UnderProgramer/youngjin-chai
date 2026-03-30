import { Module } from "@nestjs/common";
import { prismaClient } from "prisma/prisma.client";
import { AuthService } from "src/user/auth/auth.service";
import { UserManager } from "src/user/user.manager";
import { UserRepository } from "src/user/user.repository";
import { MediasoupGateway } from "./mediasoup.gateway";
import { MediasoupService } from "./mediasoup.service";
import { TransportService } from "./transport/transport.service";

@Module({
    providers: [
        MediasoupService,
        MediasoupGateway,
        TransportService,
        AuthService,
        UserRepository,
        UserManager,
        prismaClient,
    ],
})
export class MediasoupModule {}
