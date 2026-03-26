import { IsString, IsBoolean } from "class-validator"

export class CreateRoom {
    @IsString()
    roomName: string

    @IsString()
    roomDescription: string

    @IsBoolean()
    roomIsPrivate: boolean
}