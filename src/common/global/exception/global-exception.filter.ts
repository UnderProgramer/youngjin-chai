import { ArgumentsHost, ExceptionFilter, HttpException, Injectable, Logger } from "@nestjs/common";
import { DiscordService } from "../discord.service";
import { WsException } from "@nestjs/websockets";

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
            const message =
                typeof res === "string"
                    ? res
                    : Array.isArray((res as any).message)
                        ? (res as any).message.join(", ")
                        : (res as any).message ?? exception.message;

            //this.discordService.errorLogger(status, exception.message, request.url)

            this.log.error(
                `${request.method} ${request.url} -> ${status} ${message}`,
                exception.stack,
            )

            return response.status(status).json({
                ...(typeof res === "string" ? { message: res } : res),
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
            })
        }

        this.log.error(
            `${request.method} ${request.url} -> 500 Internal Server Error`,
            exception instanceof Error ? exception.stack : undefined,
        )

        return response.status(500).json({
            message: "Internal server error",
            statusCode: 500,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        })
    }

    private handleWsException(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToWs()
        const client = ctx.getClient()

        if(exception instanceof WsException) {
            this.discordService.WsErrorLogger(exception.message)

            this.log.error(exception.message, exception.stack)

            const error = exception.getError()

            client.emit("error", {
                ...(typeof error === "string" ? { message: error } : error),
                timestamp: new Date().toISOString(),
            });
            return
        }
    }
}
