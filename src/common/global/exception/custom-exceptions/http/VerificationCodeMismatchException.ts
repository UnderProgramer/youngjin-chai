import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./BaseException";

export class VerificationCodeMismatchException extends BaseException {
    constructor(email: string) {
        super(
            `Verification code for ${email} does not match.`,
            HttpStatus.BAD_REQUEST,
            "VERIFICATION_CODE_MISMATCH",
        );
    }
}
