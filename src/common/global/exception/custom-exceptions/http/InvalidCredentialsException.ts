import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./BaseException";

export class InvalidCredentialsException extends BaseException {
    constructor() {
        super(
            "Invalid email or password.",
            HttpStatus.UNAUTHORIZED,
            "INVALID_CREDENTIALS",
        );
    }
}
