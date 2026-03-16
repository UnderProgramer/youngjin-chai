import { HttpException, HttpStatus } from "@nestjs/common";

export class BaseException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly errorCode?: string
  ) {
    super(
      {
        message,
        errorCode,
        statusCode: status,
      },
      status
    );
  }
}