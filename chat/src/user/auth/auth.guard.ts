import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "src/common/decorators/decorator.public";
import { AuthService } from "./auth.service";
import { Logger } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private reflector: Reflector){}

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
            Logger.error("[AuthGuard] Token not found")
            throw new UnauthorizedException()
        }

        try{
            const payload = await this.authService.variftyAccessToken(token)

            request['user'] = payload
        } catch {
            Logger.error("Not verified")
            throw new UnauthorizedException();
        }

        return true;
    }
}