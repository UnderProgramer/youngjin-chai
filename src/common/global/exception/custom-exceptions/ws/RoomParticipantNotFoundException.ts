import { WsBaseException } from "./WsBaseException";

export class RoomParticipantNotFoundException extends WsBaseException {
    constructor(roomCode: string, userId: number) {
        super(
            `User ${userId} is not a participant of room ${roomCode}.`,
            "ROOM_PARTICIPANT_NOT_FOUND",
        );
    }
}
