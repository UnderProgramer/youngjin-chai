import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsBoolean } from "class-validator"

export class CreateRoom {
    @ApiProperty({
        example: "Weekend Study Room",
        description: "Displayed room title.",
    })
    @IsString()
    roomName: string

    @ApiProperty({
        example: "Free talking room for weekend study members.",
        description: "Detailed room description.",
    })
    @IsString()
    roomDescription: string

    @ApiProperty({
        example: false,
        description: "Whether the room requires private invitation.",
    })
    @IsBoolean()
    roomIsPrivate: boolean
}
