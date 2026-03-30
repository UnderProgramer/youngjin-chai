import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./BaseException";

export class InvalidAccessTokenException extends BaseException {
    constructor() {
        super(
            "Access token is invalid or expired.",
            HttpStatus.UNAUTHORIZED,
            "INVALID_ACCESS_TOKEN",
        );
    }
}
