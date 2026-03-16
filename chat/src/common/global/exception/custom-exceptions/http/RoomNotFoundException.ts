import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./BaseException";

export class RoomNotFoundException extends BaseException {
  constructor(RoomId : string) {
    super(
        `Room ${RoomId} is Not Found`,
        HttpStatus.NOT_FOUND,
        "ROOM_NOT_FOUND",
    );
  }
}