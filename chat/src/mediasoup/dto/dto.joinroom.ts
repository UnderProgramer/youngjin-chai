import { IsDefined, IsNotEmpty } from "class-validator"

export class JoinRoomDTO{
    
    @IsNotEmpty()
    @IsDefined()
    readonly roomId: string

    @IsNotEmpty()
    @IsDefined()
    readonly peerId: string
}