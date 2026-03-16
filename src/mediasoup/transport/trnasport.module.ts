import { Module } from "@nestjs/common";
import { TransportService } from "./transport.service";
import { MediasoupService } from "../mediasoup.service";

@Module(
    {
        providers: [
            TransportService,
            MediasoupService
        ]
    }
)
export class MediasoupModule {}