import { 
  SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, 
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/user/auth/auth.service';

@WebSocketGateway(3000, {
  namespace : "/chat/global",
  cors: '*' 
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit{
  @WebSocketServer() server: Server;
  constructor(private authService: AuthService){}

  private readonly ERROR_MESSAGE = "SocketErr"

  logger = new Logger(ChatGateway.name);


  afterInit(server: Server) {
    this.logger.log('server inited')
    this.server.emit('initServer', "server is started")
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const token = client.handshake.auth.token

    if(!token){
      client.emit(this.ERROR_MESSAGE, { code: 'UNAUTHORIZED', message: 'Invalid token' })
      client.disconnect()
    }

    try{

      const payload = await this.authService.variftyAccessToken(token)
      client.data.user = {
        id: payload.sub,
        username: payload.username,
      }

      this.logger.log(`connected    : ${client.id}`)
    } catch {
      client.emit(this.ERROR_MESSAGE, { code: 'UNAUTHORIZED', message: 'Invalid token' })

      client.disconnect()
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`disconnected : ${client.id}`)
  }

  @SubscribeMessage('message')
  handleEvent(@ConnectedSocket() client: Socket, @MessageBody() data : any) {
    const message = {
      username: client.data.user.username,
      text: data,
    };

    client.broadcast.emit('message', message)
    this.logger.log(`${client.data.user.username} : ${data}`)
  }
}
