import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsUnauthorizedException } from 'src/common/global/exception/custom-exceptions/ws/WsUnauthorizedException';
import { AuthService } from 'src/user/auth/auth.service';
import { UserManager } from 'src/user/user.manager';
import { ChatService } from './chat.service';

@WebSocketGateway({
    namespace: "/chat",
    cors: '*',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;

    constructor(
        private readonly authService: AuthService,
        private readonly chatService: ChatService,
        private readonly userManager: UserManager,
    ) {}

    private readonly errorMessage = "SocketErr";
    private readonly logger = new Logger(ChatGateway.name);

    afterInit() {
        this.logger.log('server inited');
        this.server.emit('initServer', "server is started");
    }

    async handleConnection(@ConnectedSocket() client: Socket) {
        const token =
            client.handshake.auth.token ??
            client.handshake.headers.authorization ??
            client.handshake.query.token;

        if (!token) {
            client.emit(this.errorMessage, new WsUnauthorizedException().getError());
            client.disconnect();
            return;
        }

        try {
            const payload = await this.authService.variftyAccessToken(token);
            const user = await this.userManager.getUserByIdOrThrow(payload.sub);

            client.data.user = user;
            this.logger.log(`connected    : ${client.id}`);
        } catch {
            client.emit(this.errorMessage, new WsUnauthorizedException().getError());
            client.disconnect();
        }
    }

    handleDisconnect(@ConnectedSocket() client: Socket) {
        this.logger.log(`disconnected : ${client.id}`);
    }

    @SubscribeMessage('joinRoom')
    async handleJoin(
        @ConnectedSocket() client: Socket,
        @MessageBody() roomCode: string,
    ) {
        await this.chatService.joinRoom(roomCode, client.data.user);
        client.join(roomCode);

        return { success: true };
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomCode: string; message: string; date: string },
    ) {
        await this.chatService.message(client.data.user, data.message);

        const message = {
            username: client.data.user.username,
            text: data.message.trim(),
            date: data.date,
        };

        this.server.to(data.roomCode).emit('message', message);
        this.logger.log(`${client.data.user.username} sent a message to ${data.roomCode}`);
    }

    @SubscribeMessage('inviteUser')
    async handleInviteUser(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomCode: string; email: string },
    ) {
        await this.chatService.invitePrivateRoom(data.roomCode, client.data.user, data.email);

        return { invited: true };
    }
}
