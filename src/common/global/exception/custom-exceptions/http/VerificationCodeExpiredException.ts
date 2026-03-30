import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./BaseException";

export class VerificationCodeExpiredException extends BaseException {
    constructor(email: string) {
        super(
            `Verification code for ${email} has expired.`,
            HttpStatus.BAD_REQUEST,
            "VERIFICATION_CODE_EXPIRED",
        );
    }
}
