import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./BaseException";

export class UserNotFoundException extends BaseException {
  constructor(userId : string) {
    super(
        `User ${userId} Not Found`,
        HttpStatus.NOT_FOUND,
        "USER_NOT_FOUND"
    );
  }
}