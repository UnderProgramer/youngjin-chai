import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./BaseException";

export class UserAlreadyExistsException extends BaseException {
    constructor(email: string) {
        super(
            `User with email ${email} already exists.`,
            HttpStatus.CONFLICT,
            "USER_ALREADY_EXISTS",
        );
    }
}
