import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { prismaClient } from 'prisma/prisma.client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth/auth.service';
import { Response } from 'express';

import { registerRequest, registerResponse, loginRequest, loginResponse, refreshResponse, verifyEmail } from './dto/index';
import { findUserResponse } from './dto/find-user-response';
import { EmailService } from 'src/common/global/email.service';
import { ReportRequest } from './dto/report-request';
import { DiscordService } from 'src/common/global/discord.service';

@Injectable()
export class UserService {
    constructor(
        private prisma : prismaClient,
        private authService : AuthService,
        private emailService : EmailService,
        private discordService : DiscordService
    ){}

    private generateCode () {
        const pool = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let result : string = ''

        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length)
            result += pool[randomIndex]
        }

        return result
    }


    private async findUser(email : string) {
        const user = await this.prisma.users.findUnique({
            where: {
                email: email
            }
        })

        if(!user) {
            throw new NotFoundException("User not Found");
        }
        return user
    }

    async findUserOne(email : string ) : Promise<findUserResponse> {
        const user = await this.findUser(email)

        return {
            username : user.username,
            email : user.email,
            blacklisted : user.blacklisted,
            role : user.role
        }
        
    }

    async register(req : registerRequest) : Promise<registerResponse> {
        const hash = await bcrypt.hash(req.password, 12);
        
        const user = await this.prisma.users.create({
                        data:{
                            username:       req.username,
                            email:          req.email,
                            password:       hash,
                        },
                        select: {
                            username: true,
                            email: true
                        }
                    })

        return {
            username : user.username,
            email    : user.email
        }
    }

    async sendVerifyEmail(email : string) {
        const code = this.generateCode()
        const user = await this.findUser(email)

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); //5분

        await this.emailService.sendEmailMessage(email, code)

        await this.prisma.verify_code.upsert({
            where : {
                userid : user.id
            },
            create : {
                code : code,
                userid : user.id,
                expired_at : expiresAt,
            },
            update : {
                code : code,
                expired_at : expiresAt
            }
        })
    }

    async verifyCode (data : verifyEmail) {
        const user = await this.findUser(data.email)

        const result = await this.prisma.verify_code.findFirst({
            where: {
                userid : user.id
            },
            orderBy : {
                created_at : 'desc'
            }
        })
        if(!result){ throw new BadRequestException('인증 코드 만료 됨') }
        if(result.code != data.code) { throw new BadRequestException('인증 코드가 일치 하지 않음') }

        await this.prisma.users.update({
            where : {
                email : data.email
            },
            data : {
                is_verified : true
            }
        })

        return true
    }

    async login(request: loginRequest, ip: string, res: Response) : Promise<loginResponse>{

        const user = await this.findUser(request.email)

        const isMatch = await bcrypt.compare(request.password, user.password)
        
        if (!isMatch) { throw new UnauthorizedException("password is Not valid") }

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
            accessToken : accessToken,
        }
    }


    async refresh(refreshToken: string) : Promise<refreshResponse> {
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
            accessToken : access
        }
    }

    async report(email : string, userReportReq : ReportRequest) {
        const user = await this.findUser(email)
        this.discordService.reportLogger(user, userReportReq.reason)
    }

}
