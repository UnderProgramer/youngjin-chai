import { 
  SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, 
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/user/auth/auth.service';
import { CreateRoom } from './dto/chat.create-room';
import { ChatService } from './chat.service';
import { prismaClient } from 'prisma/prisma.client';

@WebSocketGateway({
  namespace : "/chat",
  cors: '*' 
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit{
  @WebSocketServer() server: Server;
  constructor(
    private authService: AuthService, 
    private chatService: ChatService,
    private prismaClient: prismaClient
  ){}

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

      client.data.user = user

      this.logger.log(`connected    : ${client.id}`)
    } catch {
      client.emit(this.ERROR_MESSAGE, { code: 'UNAUTHORIZED', message: 'Invalid token' })

      client.disconnect()
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`disconnected : ${client.id}`)
  }
  @SubscribeMessage('joinRoom')
  handleJoin(
    @ConnectedSocket() client : Socket,
    @MessageBody() roomCode : string
  ){
    const user = client.data.user
    try {
      this.chatService.joinRoom(roomCode, user)
      client.join(roomCode)
      return { success : true }
    }catch (e) {
      return { success : false, message : e.message }
    } 
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data : { roomCode: string; message: string, date: string }
  ) {
    const message = {
      username: client.data.user.username,
      text: data.message,
      date : data.date,
    };

    this.server.to(data.roomCode).emit('message', message)
    //this.logger.log(`${client.data.user.username} : ${data}`)
    this.chatService.message(client.data.user, data.message)

  }

  @SubscribeMessage('inviteUser')
  handleInviteUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data : { roomCode: string; email: string }
  ){
    try{
      this.chatService.invitePrivateRoom(data.roomCode, client.data.user, data.email)
    } catch(e){
      return {invited : false, message : e.message}
    }
  }

}
