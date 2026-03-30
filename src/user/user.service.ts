import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { DiscordService } from 'src/common/global/discord.service';
import { EmailService } from 'src/common/global/email.service';
import {
    loginRequest,
    loginResponse,
    refreshResponse,
    registerRequest,
    registerResponse,
    reportResponse,
    sendEmailResponse,
    verifyEmail,
} from './dto';
import { ReportRequest } from './dto/report-request';
import { AuthService } from './auth/auth.service';
import { UserManager } from './user.manager';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(
        private readonly authService: AuthService,
        private readonly emailService: EmailService,
        private readonly discordService: DiscordService,
        private readonly userManager: UserManager,
        private readonly userRepository: UserRepository,
    ) {}

    private readonly logger = new Logger(UserService.name);

    async findUserOne(id: number) {
        const user = await this.userManager.getUserByIdOrThrow(id);

        return {
            username: user.username,
            email: user.email,
            blacklisted: user.blacklisted,
            role: user.role,
        };
    }

    async register(req: registerRequest): Promise<registerResponse> {
        this.logger.log('Attempting to register new user');
        await this.userManager.ensureEmailNotExists(req.email);

        const hash = await bcrypt.hash(req.password, 12);
        const user = await this.userRepository.createUser({
            username: req.username,
            email: req.email,
            password: hash,
        });

        this.logger.log('User created successfully in the database');

        return {
            username: user.username,
            email: user.email,
        };
    }

    async sendVerifyEmail(email: string): Promise<sendEmailResponse> {
        const code = this.userManager.generateCode();
        const user = await this.userManager.getUserByEmailOrThrow(email);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await this.emailService.sendEmailMessage(email, code);
        await this.userRepository.upsertVerifyCode(user.id, code, expiresAt);

        return {
            success: true,
            message: 'Verification email has been sent.',
        };
    }

    async verifyCode(data: verifyEmail) {
        await this.userManager.validateVerificationCode(data.email, data.code);
        await this.userRepository.markUserVerifiedByEmail(data.email);

        return true;
    }

    async login(request: loginRequest, ip: string, res: Response): Promise<loginResponse> {
        const user = await this.userManager.validateLoginUser(request.email, request.password);
        const accessToken = await this.authService.generateAccessToken(user);
        const refreshToken = await this.authService.generateRefreshToken(user);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this.userRepository.upsertLoginIp(user.id, ip);
        await this.userRepository.upsertRefreshToken(user.email, refreshToken, expiresAt);

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
        });

        return {
            accessToken,
        };
    }

    async refresh(refreshToken?: string): Promise<refreshResponse> {
        const refresh = await this.userManager.getRefreshOrThrow(refreshToken);
        await this.authService.verfiyRefreshToken(refresh.refresh_token);
        const user = await this.userManager.getUserByEmailOrThrow(refresh.email);
        const accessToken = await this.authService.generateAccessToken(user);

        return {
            accessToken,
        };
    }

    async report(id: number, userReportReq: ReportRequest): Promise<reportResponse> {
        const user = await this.userManager.getUserByIdOrThrow(id);
        await this.userRepository.createReport(user.id, userReportReq.reason);
        this.discordService.reportLogger(user, userReportReq.reason);

        return {
            message: 'Report submitted successfully.',
        };
    }
}
