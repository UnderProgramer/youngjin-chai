import { IsEmail, IsNotEmpty, IsDefined } from "class-validator";

export class registerRequest {
    @IsDefined()
    @IsNotEmpty()
    readonly username: string

    @IsDefined()
    @IsEmail()
    readonly email   : string

    @IsDefined()
    @IsNotEmpty()
    readonly password: string
}