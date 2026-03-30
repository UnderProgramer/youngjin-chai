import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./BaseException";

export class VerificationCodeNotFoundException extends BaseException {
    constructor(email: string) {
        super(
            `Verification code for ${email} was not found.`,
            HttpStatus.BAD_REQUEST,
            "VERIFICATION_CODE_NOT_FOUND",
        );
    }
}
