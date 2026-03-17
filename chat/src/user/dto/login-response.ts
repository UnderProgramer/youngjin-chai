import { ApiProperty } from "@nestjs/swagger";

export class loginResponse {

    @ApiProperty({example : 'string'})
    readonly accessToken : string
}