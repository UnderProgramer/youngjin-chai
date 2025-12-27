import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer, MessageBody } from "@nestjs/websockets";
import { MediasoupService } from "./mediasoup.service";
import { Socket } from "socket.io";
import { InternalServerErrorException, Logger, } from "@nestjs/common";
import { Server } from "socket.io";
import { JoinRoomDTO } from "./dto/dto.joinroom";
import { TransportService } from "./transport/transport.service";

@WebSocketGateway({cors : '*'})
export class MediasoupGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    private logger = new Logger()

    constructor(private readonly mediasoupService: MediasoupService,
                private readonly transportService: TransportService
    ){}

    afterInit() {
        this.logger.log('inited mediasoup server')
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`connected : ${client.id}`)
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`disconnected : ${client.id}`)
    }

    @SubscribeMessage('joinroom')
    async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: JoinRoomDTO){
        const router = await this.mediasoupService.getRouter(data.roomId)
        
        if(!router) {
            throw new InternalServerErrorException
        }

        return {
            rtpCapabilities: router.rtpCapabilities,
        }
    }
    
    @SubscribeMessage('createTransport')
    async handleCreateTransport(
            @ConnectedSocket() client: Socket,
            @MessageBody() data: any,
        ) {
            console.log('createTransport called', data);

            const params = await this.transportService.createTransport(
            data.roomId,
            client.id,
            data.direction,
            );

            console.log('createTransport return');

            return params;
        }    
}