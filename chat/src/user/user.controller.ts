import { Body, Controller, Logger, Post, Get, Ip, Res ,Req ,HttpCode, Put, UseGuards } from '@nestjs/common';
import { registerRequest } from './dto/register-reqpuest'
import { loginRequest } from './dto/login-request';
import { Public } from 'src/common/decorators/decorator.public';
import { UserService } from './user.service';
import { User } from 'src/common/decorators/decorator.user';
import express from 'express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { loginResponse, refreshResponse, registerResponse, verifyEmail } from './dto';
import { findUserResponse } from './dto/find-user-response';
import { ReportRequest } from './dto/report-request';
import { AuthGuard } from './auth/auth.guard';

@ApiTags('users')
@Controller('auth')
@UseGuards(AuthGuard)
export class UserController {
    constructor(private userService : UserService){}

    logger = new Logger();

    @ApiOkResponse({
        description : "[find User Response]",
        type : findUserResponse
    })
    @Get('user')
    findUser(@User('sub') id : number) {
        return this.userService.findUserOne(id)
    }

    @Public()
    @ApiOkResponse({
        description : "[register User Response]",
        type : registerResponse
    })
    @Post('register')
    register(@Body() data : registerRequest) {
        return this.userService.register(data)
    }

    @Public()
    @Post('code')
    @ApiOkResponse({
        description : "[verify code] : 코드 보내기 요청 후 요청",
        type : verifyEmail
    })
    verifyCode(@Body() data : verifyEmail) {
        return this.userService.verifyCode(data)
    }
    @Public()
    @Post('email')
    @ApiOkResponse({
        description : '[send code] : 회원 가입 후 요청',
        example : { email : 'example@email.com' }
    })
    sendCode(@Body('email') email : string) {
        return this.userService.sendVerifyEmail(email)
    }

    @Public()
    @ApiOkResponse({
        description : "[login response] : 리턴 값에 리프레시 토큰 없습니다 , 쿠키에 넣어 줍니다",
        type : loginResponse
    })
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
    @ApiOkResponse({
        description : "[refresh response] : 로그인 하고 나면 어차피 쿠키 값으로 전달 되서 값을 딱히 넣어줄게 없음 axios create 에 'withCredentials: true,' 추가 해주세요",
        type : refreshResponse
    })
    @Post('refresh')
    @HttpCode(200)
    refresh(@Req() req: express.Request) {
        const refreshToken = req.cookies['refresh_token'];

        const accessToken = this.userService.refresh(refreshToken)
        
        return accessToken
    }

    @ApiOkResponse({
        description: "[report response] : 신고 기능",
        type : ReportRequest
    })
    @Post('report')
    @HttpCode(200)
    report(@User('sub') id : number, @Body() reportReq : ReportRequest) {
        this.userService.report(id, reportReq)

        return "신고 완료"
    } 

}
