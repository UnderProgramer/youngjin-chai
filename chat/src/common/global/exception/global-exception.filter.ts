import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Injectable, Logger } from "@nestjs/common";
import { DiscordService } from "../discord.service";
import { WsException } from "@nestjs/websockets";

@Catch(HttpException)
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly discordService : DiscordService){}
    private readonly log = new Logger(GlobalExceptionFilter.name)

    catch(exception: unknown, host: ArgumentsHost) {
        const type = host.getType();

        if(type === "http") {
            this.handleHttpException(exception, host)
            return
        }
        
        if(type === "ws") {
            this.handleWsException(exception, host)
            return
        }
    }

    private handleHttpException(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest<Request>();

        if(exception instanceof HttpException) {
            const status = exception.getStatus()
            const res = exception.getResponse()

            this.discordService.errorLogger(status, exception.message, request.url)

            this.log.error(exception.cause, exception.stack)

            return response.status(status).json({
                ...(typeof res === "string" ? { message: res } : res),
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
            })
        }
    }

    private handleWsException(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToWs()
        const client = ctx.getClient()

        if(exception instanceof WsException) {
            this.discordService.WsErrorLogger(exception.message)

            this.log.error(exception.cause, exception.stack)

            const error = exception.getError()

            client.emit("error", {
                ...(typeof error === "string" ? { message: error } : error),
                timestamp: new Date().toISOString(),
            });
            return
        }
    }
}