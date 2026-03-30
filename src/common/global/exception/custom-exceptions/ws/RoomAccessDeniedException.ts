import { WsBaseException } from "./WsBaseException";

export class RoomAccessDeniedException extends WsBaseException {
    constructor(roomCode: string) {
        super(
            `Room ${roomCode} is private and cannot be joined directly.`,
            "ROOM_ACCESS_DENIED",
        );
    }
}
