import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Users } from "@prisma/client";

@Injectable()
export class AuthService {
    constructor(
        private jwtService : JwtService,
        private readonly config : ConfigService,
    ){}
    
    async generateAccessToken(user : Users) {
        return await this.jwtService.signAsync(
            { 
                sub : user.id,
                username : user.username,
                role : user.role
            },
            {
                expiresIn: '2m'
            }
        )
    }
    async generateRefreshToken(user : Users) {
        return await this.jwtService.signAsync(
            {
                sub : user.id,
                type: 'refresh' 
            },
            {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }
        )
    }

    async variftyAccessToken(token : string) {
        try {
            const payload = await this.jwtService.verifyAsync(
                token, 
            )

            return {
                sub      : payload.sub,
                username : payload.username,
                role     : payload.role
            }
        } catch {
            throw new UnauthorizedException();
        }
    }

    async verfiyRefreshToken(token : string) {
        try {
            const secret = this.config.get<string>('JWT_REFRESH_SECRET')
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: secret
                }
            )

            return {
                sub      : payload.sub
            }
        } catch {
            throw new UnauthorizedException();
        }
    }
}
