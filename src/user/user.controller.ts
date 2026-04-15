import { Body, Controller, Get, HttpCode, Ip, Logger, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import express from 'express';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCookieAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '../common/decorators/decorator.user';
import { Public } from '../common/decorators/decorator.public';
import { AuthGuard } from './auth/auth.guard';
import {
    loginResponse,
    refreshResponse,
    registerResponse,
    reportResponse,
    sendEmailRequest,
    sendEmailResponse,
    verifyEmail,
} from './dto/index';
import { loginRequest } from './dto/login-request';
import { registerRequest } from './dto/register-reqpuest';
import { findUserResponse } from './dto/find-user-response';
import { ReportRequest } from './dto/report-request';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Express } from 'express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

function generateFileName(req: any, file: any, cb: any) {
    const unique = `${Date.now()}-${uuidv4()}`;
    const ext = file.originalname.split('.').pop();
    cb(null, `${unique}.${ext}`);
}

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('api/users')
@UseGuards(AuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    readonly logger = new Logger(UserController.name);

    @ApiOperation({
        summary: '현재 사용자 프로필 조회',
        description: 'Access token 기준으로 로그인한 사용자의 기본 프로필을 조회합니다.',
    })
    @ApiOkResponse({
        description: '현재 사용자 프로필 조회 성공',
        type: findUserResponse,
    })
    @ApiUnauthorizedResponse({ description: '유효한 access token이 필요합니다.' })
    @Get('profile')
    findUser(@User('sub') id: number) {
        return this.userService.findUserOne(id);
    }
    
    @Public()
    @Post('profile/image')
    @UseInterceptors(FileInterceptor('profile', {
        storage: diskStorage({
            destination: './uploads',
            filename: generateFileName,
        })
    }))
    async uploadProfilePicture(
        @UploadedFile() file : Express.Multer.File,
        @User('sub') id: number,
    ) {
        await this.userService.uploadProfilePicture(file, id);
        return true;
    }

    @Get('profile/image')
    async getProfilePicture(@User('sub') id: number) {
        return this.userService.getProfilePicture(id);
    }
    
    @Public()
    @ApiOperation({
        summary: '회원가입',
        description: '새 사용자를 등록합니다. 이미 같은 이메일이 존재하면 예외를 반환합니다.',
    })
    @ApiCreatedResponse({
        description: '회원가입 성공',
        type: registerResponse,
    })
    @ApiBadRequestResponse({ description: '잘못된 요청이거나 이미 존재하는 이메일입니다.' })
    @Post('auth/register')
    register(@Body() data: registerRequest) {
        return this.userService.register(data);
    }

    @Public()
    @ApiOperation({
        summary: '이메일 인증 코드 검증',
        description: '발급된 인증 코드를 검증하고 사용자를 인증 완료 상태로 변경합니다.',
    })
    @ApiOkResponse({
        description: '인증 코드 검증 성공',
        example: true,
    })
    @ApiBadRequestResponse({ description: '인증 코드가 없거나, 만료되었거나, 일치하지 않습니다.' })
    @Post('auth/code')
    verifyCode(@Body() data: verifyEmail) {
        return this.userService.verifyCode(data);
    }

    @Public()
    @ApiOperation({
        summary: '이메일 인증 코드 발송',
        description: '등록된 이메일 주소로 6자리 인증 코드를 발송합니다.',
    })
    @ApiBody({ type: sendEmailRequest })
    @ApiOkResponse({
        description: '인증 메일 발송 성공',
        type: sendEmailResponse,
    })
    @ApiBadRequestResponse({ description: '잘못된 이메일이거나 사용자를 찾을 수 없습니다.' })
    @Post('auth/email')
    sendCode(@Body() body: sendEmailRequest) {
        return this.userService.sendVerifyEmail(body.email);
    }

    @Public()
    @ApiOperation({
        summary: '로그인',
        description: '이메일과 비밀번호를 검증하고 access token을 반환합니다. refresh token은 쿠키에 저장됩니다.',
    })
    @ApiOkResponse({
        description: '로그인 성공',
        type: loginResponse,
    })
    @ApiUnauthorizedResponse({ description: '이메일 또는 비밀번호가 올바르지 않습니다.' })
    @Post('auth/login')
    @HttpCode(200)
    login(
        @Body() data: loginRequest,
        @Ip() ip: string,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        return this.userService.login(data, ip, res);
    }

    @Public()
    @ApiOperation({
        summary: 'Access token 재발급',
        description: '쿠키에 저장된 refresh token으로 새로운 access token을 발급합니다.',
    })
    @ApiCookieAuth('refresh_token')
    @ApiOkResponse({
        description: 'Access token 재발급 성공',
        type: refreshResponse,
    })
    @ApiUnauthorizedResponse({ description: 'refresh token이 없거나 유효하지 않습니다.' })
    @Post('auth/refresh')
    @HttpCode(200)
    refresh(@Req() req: express.Request) {
        const refreshToken = req.cookies['refresh_token'];
        return this.userService.refresh(refreshToken);
    }

    @ApiOperation({
        summary: '사용자 신고',
        description: '현재 로그인한 사용자가 신고 사유를 제출합니다.',
    })
    @ApiOkResponse({
        description: '신고 접수 성공',
        type: reportResponse,
    })
    @ApiUnauthorizedResponse({ description: '유효한 access token이 필요합니다.' })
    @Post('report')
    @HttpCode(200)
    report(@User('sub') id: number, @Body() reportReq: ReportRequest) {
        return this.userService.report(id, reportReq);
    }
}
