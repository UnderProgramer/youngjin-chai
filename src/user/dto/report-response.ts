import { ApiProperty } from "@nestjs/swagger";

export class reportResponse {
    @ApiProperty({ example: "Report submitted successfully." })
    readonly message: string;
}
