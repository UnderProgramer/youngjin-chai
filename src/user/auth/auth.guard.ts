import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "../../common/decorators/decorator.public";
import { AuthService } from "./auth.service";
import { AccessTokenNotFoundException } from "../../common/global/exception/custom-exceptions/http/AccessTokenNotFoundException";
import { InvalidAccessTokenException } from "../../common/global/exception/custom-exceptions/http/InvalidAccessTokenException";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private reflector: Reflector){}
    private readonly log = new Logger(AuthGuard.name)

    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers.authorization;
        
        if(!authHeader){
            return undefined
        }

        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer' || !token) {
            return undefined
        }

        return token
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride(
            IS_PUBLIC_KEY, 
            [context.getHandler(), context.getClass()],
        )

        if(isPublic) {
            return true
        }

        const request = context.switchToHttp().getRequest()
        const token = this.extractTokenFromHeader(request)
        if(!token) {
            this.log.warn(`Access token not found: ${request.method} ${request.url}`)
            throw new AccessTokenNotFoundException()
        }

        try {
            const payload = await this.authService.variftyAccessToken(token)

            request['user'] = payload
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown token verification error";
            this.log.warn(`Access token verification failed: ${request.method} ${request.url} - ${message}`)
            throw new InvalidAccessTokenException();
        }

        return true;
    }
}
