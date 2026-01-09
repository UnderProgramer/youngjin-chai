import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsDefined } from "class-validator";

export class loginRequest {
    @IsDefined()
    @IsEmail()
    @ApiProperty({example : 'example@email.com'})
    readonly email   : string

    @IsDefined()
    @IsNotEmpty()
    @ApiProperty({example : 'string_password'})
    readonly password: string
}