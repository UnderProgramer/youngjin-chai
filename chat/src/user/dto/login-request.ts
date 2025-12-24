import { IsEmail, IsNotEmpty, IsDefined } from "class-validator";

export class loginRequest {
    @IsDefined()
    @IsEmail()
    readonly email   : string

    @IsDefined()
    @IsNotEmpty()
    readonly password: string
}