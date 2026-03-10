import { WsException } from "@nestjs/websockets";

export class WsBaseException extends WsException {
  constructor(
    message: string,
    public readonly errorCode?: string
  ) {
    super(
      {
        message,
        errorCode,
      },
    );
  }
}