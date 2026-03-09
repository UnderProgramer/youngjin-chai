import { Injectable, NotFoundException } from "@nestjs/common";
import { Peer } from "./types/types.transport";
import { MediasoupService } from "../mediasoup.service";
import * as mediasoup from 'mediasoup'
import { WsException } from "@nestjs/websockets";

@Injectable()
export class TransportService {
    private peers = new Map<string, Peer>()
    
    constructor(private readonly mediasoupService : MediasoupService){}

    private getPeer(peerId: string): Peer {
        let peer = this.peers.get(peerId);

        if (!peer) {
            throw new Error("Not Found Peer")
        }

        return peer;
    }

    createPeer(peerId: string, roomId: string, userId: string) {
        if(this.peers.has(peerId)) {
            return
        }

        let peer = {
            peerId,
            roomId,
            userId,
            transports: new Map(),
            producers : new Map(),
            consumers: new Map()
        }
        this.peers.set(peerId, peer)
        console.log("피어 생성 완료")
        
    }
    
    getProducersByRoom(roomId: string): string[] {
        const producerIds: string[] = []

        this.peers.forEach(peer => {
            if (peer.roomId === roomId) {
                peer.producers.forEach((_, producerId) => {
                    producerIds.push(producerId)
                })
            }
        })

        return producerIds
    }

    async createTransport(
        roomId: string,
        peerId: string,
        direction: 'send' | 'recv',
    ) {
        const router = await this.mediasoupService.getRouter(roomId);

        const transport = await router!.createWebRtcTransport({
            listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1'}],
            enableUdp: true,
            enableTcp: true,
            enableSctp: true,
            preferUdp: true,
            numSctpStreams: { OS: 1024, MIS: 1024 },
            initialAvailableOutgoingBitrate : 1_000_000,
            appData :{
                peerId,
                direction
            }
        });
        
        const peer = this.getPeer(peerId)
        console.log(peer)
       
        peer.transports.set(transport.id, transport)
        transport.enableTraceEvent(['probation', 'bwe']);

        transport.on("routerclose", () => {
            peer?.transports.delete(transport.id);
        })
        transport.on("dtlsstatechange", (state) => {
            if(state === "closed" || state === "failed"){
                transport.close()
            }
        })

        return {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
        };
    }

    getTransport(transportId: string, peerId: string) {
        const peer = this.getPeer(peerId)
        return peer?.transports.get(transportId)
    }

    async connectTransport(
        transportId: string,
        peerId : string,
        dtlsParameters: mediasoup.types.DtlsParameters,
    ){
        const transport = this.getTransport(transportId, peerId)
        if (!transport) {
            throw new NotFoundException('Transport not found');
        }

        await transport.connect({ dtlsParameters });
    }


    async producer(
        transportId: string,
        peerId : string,
        kind : mediasoup.types.MediaKind,
        rtpParameters : mediasoup.types.RtpParameters,
        mediaTag : 'camera' | 'screen' | 'mic'
    ) {
        const peer = this.getPeer(peerId)
        const transport = this.getTransport(transportId, peerId);

        if (!transport) throw new NotFoundException('Transport not found');

        const producer = await transport.produce({
            kind,
            rtpParameters,
            appData : {
                peerId,
                mediaTag,
            }
        });

        peer.producers.set(producer.id, producer);
        
        producer.on("transportclose", () => {
            peer.producers.delete(producer.id)
        })

        return producer;
    }

    async consumer(
        peerId: string,
        roomId: string,
        transportId: string,
        producerId: string,
        rtpCapabilities: mediasoup.types.RtpCapabilities,
    ) {
        const peer = this.getPeer(peerId)
        const transport = this.getTransport(transportId, peerId)

        if (!transport) throw new NotFoundException('Transport not found');

        const router = await this.mediasoupService.getRouter(roomId);

        if (!router!.canConsume({ producerId, rtpCapabilities })) {
            throw new Error('Cannot consume');
        }

        const consumer = await transport.consume({
            producerId,
            rtpCapabilities,
            paused: true,
        });

        peer.consumers.set(consumer.id, consumer)

        return consumer;
    }

    async resumeConsumers(
        consumerId : string,
        peerId : string,
    ) {
        const peer = this.getPeer(peerId)
        const consumer = peer.consumers.get(consumerId)
        
        if(!consumer) {
            throw new WsException('Consumer not found')
        }

        if(!consumer.paused) {
            return;
        }

        await consumer.resume()
    }

    async handleDisconnect(peerId : string) {
        const peer = this.getPeer(peerId)

        peer.transports.forEach(t => t.close());
        peer.consumers.forEach(c => c.close());

        this.peers.delete(peerId);
    }

}