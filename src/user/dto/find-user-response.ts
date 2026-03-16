import { ApiProperty } from "@nestjs/swagger"

export class findUserResponse {
    @ApiProperty({example : 'test_username'})
    readonly username : string
    
    @ApiProperty({example : 'example@email.com'})
    readonly email    : string
    
    @ApiProperty({example : false})
    readonly blacklisted : boolean
    
    @ApiProperty({example : 'USER'})
    readonly role     : string
}