import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./BaseException";

export class EmailVerificationRequiredException extends BaseException {
    constructor() {
        super(
            "Email verification is required to access this content.",
            HttpStatus.FORBIDDEN,
            "EMAIL_VERIFICATION_REQUIRED",
        );
    }
}
