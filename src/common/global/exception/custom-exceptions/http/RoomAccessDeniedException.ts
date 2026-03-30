import { HttpStatus } from "@nestjs/common";
import { BaseException } from "./BaseException";

export class RoomAccessDeniedException extends BaseException {
    constructor(roomCode: string) {
        super(
            `Room ${roomCode} is private and cannot be joined directly.`,
            HttpStatus.FORBIDDEN,
            "ROOM_ACCESS_DENIED",
        );
    }
}
