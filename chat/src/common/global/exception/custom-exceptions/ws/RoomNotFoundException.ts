import { WsBaseException } from "./WsBaseException";

export class RoomNotFoundException extends WsBaseException {
  constructor(RoomId : string) {
    super(
        `Room ${RoomId} Not Found`,
        "ROOM_NOT_FOUND"
    );
  }
}