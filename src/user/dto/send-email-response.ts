import { ApiProperty } from "@nestjs/swagger";

export class sendEmailResponse {
    @ApiProperty({ example: true })
    readonly success: boolean;

    @ApiProperty({ example: "Verification email has been sent." })
    readonly message: string;
}
