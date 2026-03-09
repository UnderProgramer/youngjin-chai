import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Injectable, Logger } from "@nestjs/common";
import { DiscordService } from "../discord.service";

@Catch(HttpException)
@Injectable()
export class HttpExceptionHandler implements ExceptionFilter {
    constructor(private readonly discordService : DiscordService){}
    private log = new Logger()

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest<Request>();

        if(exception instanceof HttpException) {
            const status = exception.getStatus();
            this.discordService.errorLogger(status, exception.message, request.url)
            this.log.error(exception.cause, exception.stack)
            return response.status(status).json({
                                            timestamp: new Date().toISOString(),
                                            path: request.url,
                                            request: request.method,
                                            message: exception.message,
                                        })
        }
        
        response
            .status(500)
            .json({
                timestamp: new Date().toISOString(),
                path: request.url,
                request: request
            });
    }
}