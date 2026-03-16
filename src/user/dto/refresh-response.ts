import { ApiProperty } from "@nestjs/swagger";

export class refreshResponse {

    @ApiProperty({example : 'string'})
    readonly accessToken : string
}