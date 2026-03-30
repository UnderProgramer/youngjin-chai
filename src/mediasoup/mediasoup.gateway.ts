import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { InternalServerErrorException, Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import { WsUnauthorizedException } from "src/common/global/exception/custom-exceptions/ws/WsUnauthorizedException";
import { AuthService } from "src/user/auth/auth.service";
import { UserManager } from "src/user/user.manager";
import { MediasoupService } from "./mediasoup.service";
import { TransportService } from "./transport/transport.service";
import type { CreateProduce, CreateTransportType } from "./transport/types/types.transport";

@WebSocketGateway({
    namespace: '/mediasoup',
    cors: '*',
})
export class MediasoupGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(MediasoupGateway.name);
    private readonly errorMessage = "SocketErr";

    constructor(
        private readonly mediasoupService: MediasoupService,
        private readonly transportService: TransportService,
        private readonly authService: AuthService,
        private readonly userManager: UserManager,
    ) {}

    afterInit() {
        this.logger.log(`inited mediasoup server`);
    }

    async handleConnection(client: Socket) {
        const token = client.handshake.auth.token;

        if (!token) {
            client.emit(this.errorMessage, new WsUnauthorizedException().getError());
            client.disconnect();
            return;
        }

        try {
            const payload = await this.authService.variftyAccessToken(token);
            const user = await this.userManager.getUserByIdOrThrow(payload.sub);

            this.logger.log(`connected : ${client.id}`);
            client.data.user = user;
            client.data.peerId = uuidv4();
        } catch {
            client.emit(this.errorMessage, new WsUnauthorizedException().getError());
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        this.logger.log(`disconnected : ${client.id}`);
        client.leave(client.data.roomId);

        const peerId = client.data.peerId;
        if (!peerId) {
            return;
        }

        await this.transportService.handleDisconnect(peerId);
    }

    @SubscribeMessage('joinroom')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() roomId: string,
    ) {
        client.join(roomId);
        client.data.roomId = roomId;

        const user = client.data.user;
        const peerId = client.data.peerId;

        this.transportService.createPeer(peerId, roomId, user.id);

        const router = await this.mediasoupService.getRouter(roomId);

        if (!router) {
            throw new InternalServerErrorException();
        }

        const existingProducerIds = this.transportService.getProducersByRoom(roomId);

        return {
            rtpCapabilities: router.rtpCapabilities,
            existingProducerIds,
        };
    }

    @SubscribeMessage('createTransport')
    async handleCreateTransport(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: CreateTransportType,
    ) {
        return this.transportService.createTransport(
            client.data.roomId,
            client.data.peerId,
            data.direction,
        );
    }

    @SubscribeMessage('connectTransport')
    async connectTransport(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { transportId: string; dtlsParameters: any },
    ) {
        await this.transportService.connectTransport(
            data.transportId,
            client.data.peerId,
            data.dtlsParameters,
        );

        return { connected: true };
    }

    @SubscribeMessage('produceData')
    async produce(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: CreateProduce,
    ) {
        const producer = await this.transportService.producer(
            data.transportId,
            client.data.peerId,
            data.kind,
            data.rtpParameters,
            data.mediaTag,
        );

        client.to(client.data.roomId).emit('newProducer', {
            producerId: producer.id,
        });

        return { id: producer.id };
    }

    @SubscribeMessage('consumeGenerate')
    async consume(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: {
            transportId: string;
            producerId: string;
            rtpCapabilities: any;
        },
    ) {
        const consumer = await this.transportService.consumer(
            client.data.peerId,
            client.data.roomId,
            data.transportId,
            data.producerId,
            data.rtpCapabilities,
        );

        return {
            id: consumer.id,
            producerId: data.producerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
        };
    }

    @SubscribeMessage('resumeConsumers')
    async resume(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { consumerId: string },
    ) {
        this.transportService.resumeConsumers(data.consumerId, client.data.peerId);
        return { resumed: true };
    }
}
