import { Injectable, NotFoundException } from "@nestjs/common";
import { TransportType } from "./types/types.transport";
import { MediasoupService } from "../mediasoup.service";
import * as mediasoup from 'mediasoup'

@Injectable()
export class TransportService {
    private transports = new Map<string, TransportType>()

    constructor(private readonly mediasoupService : MediasoupService){}

    async createTransport(
        roomId: string,
        peerId: string,
        direction: 'send' | 'recv',
    ) {
        const router = await this.mediasoupService.getRouter(roomId);

        const transport = await router!.createWebRtcTransport({
            listenIps: [{ ip: '0.0.0.0'}],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
        });

        this.transports.set(transport.id, {
            id: transport.id,
            transport,
            direction,
            peerId,
            roomId,
        });

        return {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
        };
    }

    async connectTransport(
        transportId: string,
        dtlsParameters: mediasoup.types.DtlsParameters,
    ){
        const entry = this.transports.get(transportId);
        if (!entry) {
            throw new NotFoundException('Transport not found');
        }

        await entry.transport.connect({ dtlsParameters });
    }

    getTransport(transportId: string) {
        return this.transports.get(transportId)?.transport;
    }

    closePeerTransports(peerId: string) {
        for (const [id, entry] of this.transports) {
            if (entry.peerId === peerId) {
                entry.transport.close();
                this.transports.delete(id);
            }
        }
    }
}