import { Catch, ArgumentsHost, BadRequestException } from "@nestjs/common"
import { Socket } from "socket.io"

@Catch()
export class WsExceptionFilter implements WsExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const client = host.switchToWs().getClient<Socket>()
        const message = exception instanceof BadRequestException ? exception.message : '이미 참가한 유저 입니다.'
        client.emit('SocketErr', { message })
    }
}
