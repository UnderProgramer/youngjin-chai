import { Module } from "@nestjs/common";
import { MediasoupService } from "./mediasoup.service";
import { MediasoupGateway } from "./mediasoup.gateway";
import { TransportService } from "./transport/transport.service";

@Module(
    {
        providers: [
            MediasoupService,
            MediasoupGateway,
            TransportService
        ]
    }
)
export class MediasoupModule {}