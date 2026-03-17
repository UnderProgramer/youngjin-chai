import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsDefined } from "class-validator";

export class ReportRequest {
    @IsDefined()
    @ApiProperty({example : 'test reason'})
    readonly reason : string
}