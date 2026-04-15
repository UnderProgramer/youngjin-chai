import { ApiProperty } from "@nestjs/swagger";

export class UploadProfileRequest {
    @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000.jpg" })
    pictureName : string;

    @ApiProperty({ example: "Original Image Name.jpg" })
    originalName : string;

    @ApiProperty({ example: "/uploads/123e4567-e89b-12d3-a456-426614174000.jpg" })
    pictureUrl : string;

    @ApiProperty({ example: 1 })
    userId : number;

    @ApiProperty({ example: "2024-06-01T12:00:00Z" })
    updatedAt : Date;
}