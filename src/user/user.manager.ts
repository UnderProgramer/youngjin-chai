import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { InvalidCredentialsException } from "src/common/global/exception/custom-exceptions/http/InvalidCredentialsException";
import { RefreshTokenNotFoundException } from "src/common/global/exception/custom-exceptions/http/RefreshTokenNotFoundException";
import { UserAlreadyExistsException } from "src/common/global/exception/custom-exceptions/http/UserAlreadyExistsException";
import { UserNotFoundException } from "src/common/global/exception/custom-exceptions/http/UserNotFoundException";
import { VerificationCodeExpiredException } from "src/common/global/exception/custom-exceptions/http/VerificationCodeExpiredException";
import { VerificationCodeMismatchException } from "src/common/global/exception/custom-exceptions/http/VerificationCodeMismatchException";
import { VerificationCodeNotFoundException } from "src/common/global/exception/custom-exceptions/http/VerificationCodeNotFoundException";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserManager {
    constructor(private readonly userRepository: UserRepository) {}

    generateCode() {
        const pool = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';

        for (let i = 0; i < 6; i += 1) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            result += pool[randomIndex];
        }

        return result;
    }

    async getUserByIdOrThrow(id: number) {
        const user = await this.userRepository.findUserById(id);

        if (!user) {
            throw new UserNotFoundException(`${id}`);
        }

        return user;
    }

    async getUserByEmailOrThrow(email: string) {
        const user = await this.userRepository.findUserByEmail(email);

        if (!user) {
            throw new UserNotFoundException(email);
        }

        return user;
    }

    async ensureEmailNotExists(email: string) {
        const user = await this.userRepository.findUserByEmail(email);

        if (user) {
            throw new UserAlreadyExistsException(email);
        }
    }

    async validateLoginUser(email: string, password: string) {
        const user = await this.userRepository.findUserByEmail(email);

        if (!user) {
            throw new InvalidCredentialsException();
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new InvalidCredentialsException();
        }

        return user;
    }

    async validateVerificationCode(email: string, code: string) {
        const user = await this.getUserByEmailOrThrow(email);
        const verifyCode = await this.userRepository.findLatestVerifyCodeByUserId(user.id);

        if (!verifyCode) {
            throw new VerificationCodeNotFoundException(email);
        }

        if (verifyCode.expired_at.getTime() < Date.now()) {
            throw new VerificationCodeExpiredException(email);
        }

        if (verifyCode.code !== code) {
            throw new VerificationCodeMismatchException(email);
        }

        return user;
    }

    async getRefreshOrThrow(refreshToken?: string) {
        if (!refreshToken) {
            throw new RefreshTokenNotFoundException();
        }

        const refresh = await this.userRepository.findRefreshByToken(refreshToken);

        if (!refresh) {
            throw new RefreshTokenNotFoundException();
        }

        return refresh;
    }
}
