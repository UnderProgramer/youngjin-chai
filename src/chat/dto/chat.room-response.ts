import { ApiProperty } from "@nestjs/swagger";

export class RoomResponse {
    @ApiProperty({ example: 1 })
    readonly id: number;

    @ApiProperty({ example: 3 })
    readonly userid: number;

    @ApiProperty({ example: "Open Chat Room" })
    readonly room_name: string;

    @ApiProperty({ example: "Anyone can join this room." })
    readonly room_desc: string;

    @ApiProperty({ example: "AB12CD34" })
    readonly room_code: string;

    @ApiProperty({ example: "2026-03-30T10:00:00.000Z" })
    readonly created_at: Date;

    @ApiProperty({ example: false })
    readonly is_privated: boolean;
}
