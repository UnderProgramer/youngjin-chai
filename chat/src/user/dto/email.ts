import { ApiProperty } from "@nestjs/swagger"
import { IsDefined, IsEmail } from "class-validator"

export class verifyEmail {
    @IsDefined()
    @ApiProperty({example : 'XXXXXX'})
    code : string
    
    @IsDefined()
    @IsEmail()
    @ApiProperty({example : 'example@email.com'})
    email: string
}