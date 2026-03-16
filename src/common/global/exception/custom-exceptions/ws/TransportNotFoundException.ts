import { WsBaseException } from "./WsBaseException";

export class TransportNotFoundException extends WsBaseException {
  constructor() {
    super(
        `Transport Not Found`,
        "TRANSPORT_NOT_FOUND"
    );
  }
}