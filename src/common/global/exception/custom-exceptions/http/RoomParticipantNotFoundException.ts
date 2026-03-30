import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./BaseException";

export class RoomParticipantNotFoundException extends BaseException {
    constructor(roomCode: string, userId: number) {
        super(
            `User ${userId} is not a participant of room ${roomCode}.`,
            HttpStatus.FORBIDDEN,
            "ROOM_PARTICIPANT_NOT_FOUND",
        );
    }
}
