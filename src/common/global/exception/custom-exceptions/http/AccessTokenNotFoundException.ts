import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./BaseException";

export class AccessTokenNotFoundException extends BaseException {
    constructor() {
        super(
            "Access token not found.",
            HttpStatus.UNAUTHORIZED,
            "ACCESS_TOKEN_NOT_FOUND",
        );
    }
}
