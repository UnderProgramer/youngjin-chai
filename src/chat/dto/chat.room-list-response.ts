import { ApiProperty } from "@nestjs/swagger";
import { RoomResponse } from "./chat.room-response";

export class RoomListResponse {
    @ApiProperty({ type: [RoomResponse] })
    readonly rooms: RoomResponse[];
}
