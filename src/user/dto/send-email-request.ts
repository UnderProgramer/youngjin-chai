import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsEmail } from "class-validator";

export class sendEmailRequest {
    @IsDefined()
    @IsEmail()
    @ApiProperty({ example: "example@email.com" })
    readonly email: string;
}
