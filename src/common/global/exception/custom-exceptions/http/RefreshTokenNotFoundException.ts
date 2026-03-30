import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./BaseException";

export class RefreshTokenNotFoundException extends BaseException {
    constructor() {
        super(
            "Refresh token not found.",
            HttpStatus.UNAUTHORIZED,
            "REFRESH_TOKEN_NOT_FOUND",
        );
    }
}
