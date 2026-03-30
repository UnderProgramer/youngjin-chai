import { WsBaseException } from "./WsBaseException";

export class RoomAlreadyJoinedException extends WsBaseException {
    constructor(roomCode: string, userId: number) {
        super(
            `User ${userId} is already joined in room ${roomCode}.`,
            "ROOM_ALREADY_JOINED",
        );
    }
}
