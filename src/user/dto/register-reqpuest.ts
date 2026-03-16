import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsDefined } from "class-validator";

export class registerRequest {
    @IsDefined()
    @IsNotEmpty()
    @ApiProperty({example : 'test_username'})
    readonly username: string

    @IsDefined()
    @IsEmail()
    @ApiProperty({example : 'example@email.com'})
    readonly email   : string

    @IsDefined()
    @IsNotEmpty()
    @ApiProperty({example : 'test_password'})
    readonly password: string
}