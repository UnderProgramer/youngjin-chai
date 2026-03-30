import { ApiProperty } from "@nestjs/swagger";

export class CreateRoomResponse {
    @ApiProperty({ example: "AB12CD34" })
    readonly roomCode: string;
}
