import { ApiProperty } from "@nestjs/swagger"

export class registerResponse {
    @ApiProperty({example : 'test_username'})
    readonly username : string
    
    @ApiProperty({example : 'example@email.com'})
    readonly email    : string
}