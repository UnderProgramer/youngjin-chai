import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";

@Catch(HttpException)
export class GlobalExceptionHandler implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest<Request>();

        if(exception instanceof HttpException) {
            const status = exception.getStatus();
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