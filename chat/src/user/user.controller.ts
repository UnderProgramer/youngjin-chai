import { Body, Controller, Logger, Post, Get, Ip, Res ,Req ,HttpCode, InternalServerErrorException } from '@nestjs/common';
import { registerRequest } from './dto/register-reqpuest'
import { loginRequest } from './dto/login-request';
import { Public } from 'src/common/decorators/decorator.public';
import { UserService } from './user.service';
import { User } from 'src/common/decorators/decorator.user';
import express, { Request } from 'express';

@Controller()
export class UserController {
    constructor(private userService : UserService){}

    logger = new Logger();

    @Get('user')
    findUser(@User('email') email : string) {
        return this.userService.findUser(email)
    }

    @Public()
    @Post('register')
    register(@Body() data : registerRequest) {
        return this.userService.register(data)
    }

    @Public()
    @Post('login')
    @HttpCode(200)
    login(
        @Body() data : loginRequest, 
        @Ip() ip : string,
        @Res({passthrough: true}) res: express.Response
    ) {
        return this.userService.login(data, ip, res);
    }

    @Public()
    @Post('refresh')
    @HttpCode(200)
    refresh(@Req() req: express.Request) {
        const refreshToken = req.cookies['refresh_token'];

        const accessToken = this.userService.refresh(refreshToken)
        
        return accessToken
    }

}
