import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer, MessageBody } from "@nestjs/websockets";
import { MediasoupService } from "./mediasoup.service";
import { Socket } from "socket.io";
import { InternalServerErrorException, Logger, } from "@nestjs/common";
import { Server } from "socket.io";
import { TransportService } from "./transport/transport.service";
import type { CreateProduce, CreateTransportType } from "./transport/types/types.transport";
import { AuthService } from "src/user/auth/auth.service";
import { prismaClient } from "prisma/prisma.client";
import { v4 as uuidv4 } from 'uuid';


@WebSocketGateway({ 
    namespace : '/mediasoup',
    cors: '*' 
  })
export class MediasoupGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger();
  private readonly ERROR_MESSAGE = "SocketErr"

  constructor(
    private readonly mediasoupService: MediasoupService,
    private readonly transportService: TransportService,
    private readonly authService : AuthService,
    private readonly prismaClient : prismaClient
  ) {}

  afterInit() {
    this.logger.log(`inited mediasoup server`);
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token
    
    if(!token){
      client.emit(this.ERROR_MESSAGE, { code: 'UNAUTHORIZED', message: 'Invalid token' })
      client.disconnect()
      return
    }

    try{
      const payload = await this.authService.variftyAccessToken(token)

      const user = await this.prismaClient.users.findUnique({
        where: { id: payload.sub }
      })

      if(!user) {
        client.disconnect();
        return;
      }
      this.logger.log(`connected : ${client.id}`);

      client.data.user = user
      client.data.peerId = uuidv4();
      
    } catch {
      client.emit(this.ERROR_MESSAGE, { code: 'UNAUTHORIZED', message: 'Invalid token' })
      client.disconnect()
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`disconnected : ${client.id}`);
    client.leave(client.data.roomId)
    const peerId = client.data.peerId
    if(!peerId) return;

    await this.transportService.handleDisconnect(peerId)
  }

  @SubscribeMessage('joinroom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId : string,
  ) {
    client.join(roomId)
    client.data.roomId = roomId

    const user = client.data.user
    const peerId = client.data.peerId

    this.transportService.createPeer(peerId, roomId , user.id)

    const router = await this.mediasoupService.getRouter(roomId);
    
    if (!router) {
      throw new InternalServerErrorException()
    }

    const existingProducerIds = this.transportService.getProducersByRoom(roomId)

    return {
      rtpCapabilities: router.rtpCapabilities,
      existingProducerIds
    };
  }

  @SubscribeMessage('createTransport')
  async handleCreateTransport(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateTransportType,
  ) {
    console.log('peerId:', client.data.peerId)
    console.log('roomId:', client.data.roomId)

    return await this.transportService.createTransport(
      client.data.roomId,
      client.data.peerId,
      data.direction,
    );
  }

  @SubscribeMessage('connectTransport')
  async connectTransport(
    @ConnectedSocket() client : Socket,
    @MessageBody() data: { transportId: string; dtlsParameters: any },
  ) {
    await this.transportService.connectTransport(
      data.transportId,
      client.data.peerId,
      data.dtlsParameters,
    );

    return { connected: true }
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
    // 같은 room의 다른 사용자에게 알림
    client.to(client.data.roomId).emit('newProducer', {
      producerId: producer.id,
    });

    return { id: producer.id };
  }

  @SubscribeMessage('consumeGenerate')
  async consume(
    @ConnectedSocket() client : Socket,
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
    )
    
    return {
      id: consumer.id,
      producerId: data.producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    };
  }

  @SubscribeMessage('resumeConsumers')
  async resume(
    @ConnectedSocket() client : Socket,
    @MessageBody() data : { consumerId : string }
  ) {
    this.transportService.resumeConsumers(data.consumerId, client.data.peerId);
    return { resumed : true }
  }
}
