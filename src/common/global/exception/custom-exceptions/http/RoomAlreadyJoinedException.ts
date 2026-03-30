import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./BaseException";

export class RoomAlreadyJoinedException extends BaseException {
    constructor(roomCode: string, userId: number) {
        super(
            `User ${userId} is already joined in room ${roomCode}.`,
            HttpStatus.CONFLICT,
            "ROOM_ALREADY_JOINED",
        );
    }
}
