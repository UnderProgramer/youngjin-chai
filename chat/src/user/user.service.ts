import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { registerRequest } from './dto/register-reqpuest';
import { prismaClient } from 'prisma/prisma.client';
import * as bcrypt from 'bcrypt';
import { loginRequest } from './dto/login-request';
import { AuthService } from './auth/auth.service';
import { Request, Response } from 'express';

@Injectable()
export class UserService {
    constructor(
        private prisma : prismaClient,
        private authService : AuthService
    ){}

    async register(request : registerRequest) {
        const hash = await bcrypt.hash(request.password, 12);
        
        const user = this.prisma.users.create({
                        data:{
                            username:       request.username,
                            email:          request.email,
                            password:       hash,
                        },
                        select: {
                            username: true,
                            email: true
                        }
                    })
        return user
    }

    async login(request: loginRequest, ip: string, res: Response) {

        const user = await this.prisma.users.findUnique({
            where: {
                email: request.email
            }
        })

        if(!user){
            throw new NotFoundException("user not found")
        }

        const isMatch = await bcrypt.compare(request.password, user.password)
        
        if (!isMatch){
            throw new UnauthorizedException("password is Not valid")
        }

        const accessToken = await this.authService.generateAccessToken(user)
        const refreshToken = await this.authService.generateRefreshToken(user)

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this.prisma.ip.upsert({
            where: { userid: user.id },
            create : {
                userid: user.id,
                login_ip: ip
            },
            update: {
                login_ip: ip
            }
        })
        
        await this.prisma.refresh.upsert({
            where: { email: user.email },
            create: {
                email: user.email,
                refresh_token: refreshToken,
                expired_at: expiresAt
            },
            update: {
                refresh_token: refreshToken,
                expired_at: expiresAt
            },
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
        })

        return {
            access_token : accessToken,
        }
    }

    async findUser(email : string) {
        const user = await this.prisma.users.findUnique({
            where: {
                email: email
            }
        })

        if(!user) {
            throw new NotFoundException("User not Found : findUser()");
        }

        return user
    }

    async refresh(refreshToken: string) {
        if(!refreshToken) {
            throw new BadRequestException("refresh token not found")
        }
        await this.authService.verfiyRefreshToken(refreshToken);
        const refresh = await this.prisma.refresh.findUnique({
                            where: { 
                                refresh_token: refreshToken
                            },
                        })

        if(!refresh) {
            throw new UnauthorizedException("Refresh Token is not found");
        }

        const user = await this.findUser(refresh.email)
        const access = await this.authService.generateAccessToken(user)
        
        return {
            access_token : access
        }
    }   
}
