import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer } from "@nestjs/websockets";
import { MediasoupService } from "./mediasoup.service";
import { Socket } from "socket.io";
import { InternalServerErrorException, } from "@nestjs/common";
import { Server } from "socket.io";
import { JoinRoomDTO } from "./dto/dto.joinroom";

@WebSocketGateway({cors : '*'})
export class MediasoupGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    logger

    constructor(private readonly mediasoupService: MediasoupService){}

    afterInit() {
        
    }
    handleConnection(client: Socket, ...args: any[]) {
        throw new Error("Method not implemented.");
    }
    handleDisconnect(client: Socket) {
        throw new Error("Method not implemented.");
    }

    @SubscribeMessage('joinroom')
    async handleJoinRoom(@ConnectedSocket() client: Socket, data: JoinRoomDTO){
        const router = await this.mediasoupService.getRouter(data.roomId)
        
        if(!router) {
            throw new InternalServerErrorException
        }

        return {
            rtpCapabilities: router.rtpCapabilities,
        }
    }           
    
}