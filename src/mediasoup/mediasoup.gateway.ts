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
// import { EmailVerificationRequiredException } from "../common/global/exception/custom-exceptions/ws/EmailVerificationRequiredException";
// import { WsUnauthorizedException } from "../common/global/exception/custom-exceptions/ws/WsUnauthorizedException";
// import { AuthService } from "../user/auth/auth.service";
// import { UserManager } from "../user/user.manager";
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
    server!: Server;

    private readonly logger = new Logger(MediasoupGateway.name);

    constructor(
        private readonly mediasoupService: MediasoupService,
        private readonly transportService: TransportService,
        // private readonly authService: AuthService,
        // private readonly userManager: UserManager,
    ) {}

    // private extractToken(client: Socket): string | undefined {
    //     const rawToken =
    //         client.handshake.auth.token ??
    //         client.handshake.headers.authorization ??
    //         client.handshake.query.token;
    //
    //     const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
    //
    //     if (typeof token !== "string" || !token.trim()) {
    //         return undefined;
    //     }
    //
    //     return token.startsWith("Bearer ")
    //         ? token.slice("Bearer ".length)
    //         : token;
    // }
    //
    // private toSocketMiddlewareError(exception: WsUnauthorizedException | EmailVerificationRequiredException) {
    //     const payload = exception.getError() as { message?: string };
    //     const error = new Error(payload.message ?? "Socket authorization failed.") as Error & {
    //         data?: ReturnType<WsUnauthorizedException["getError"]>;
    //     };
    //
    //     error.data = payload;
    //     return error;
    // }

    afterInit(server: Server) {
        /*
        server.use(async (client: Socket, next) => {
            const token = this.extractToken(client);

            if (!token) {
                next(this.toSocketMiddlewareError(new WsUnauthorizedException()));
                return;
            }

            try {
                const payload = await this.authService.variftyAccessToken(token);
                const user = await this.userManager.getUserByIdOrThrow(payload.sub);

                if (!user.is_verified) {
                    next(this.toSocketMiddlewareError(new EmailVerificationRequiredException()));
                    return;
                }

                client.data.user = user;
                client.data.peerId = uuidv4();

                next();
            } catch {
                next(this.toSocketMiddlewareError(new WsUnauthorizedException()));
            }
        });
        */

        server.use((client: Socket, next) => {
            // Test-only bypass for mediasoup socket auth.
            client.data.peerId = uuidv4();
            client.data.user = { id: `guest-${client.id}` };
            next();
        });

        this.logger.log(`inited mediasoup server`);
    }

    async handleConnection(client: Socket) {
        this.logger.log(`connected : ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        this.logger.log(`disconnected : ${client.id}`);
        const roomId = client.data.roomId;
        const peerId = client.data.peerId;

        if (roomId && peerId) {
            this.server.to(roomId).emit('peerLeft', { peerId });
        }

        client.leave(roomId);

        if (!peerId) {
            return;
        }
        
        try {
            await this.transportService.handleDisconnect(peerId);
        } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error(String(e));
            this.logger.warn(`handleDisconnect 실패: ${error.message}`);
        }
    }

    @SubscribeMessage('joinroom')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() roomId: string,
    ) {
        const peerId = client.data.peerId ?? uuidv4();
        const userId = String(client.data.user?.id ?? `guest-${client.id}`);

        client.data.peerId = peerId;

        client.join(roomId);
        client.data.roomId = roomId;

        this.transportService.createPeer(peerId, roomId, userId);

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
