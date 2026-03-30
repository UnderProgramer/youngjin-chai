import { WsBaseException } from "./WsBaseException";

export class WsUnauthorizedException extends WsBaseException {
    constructor() {
        super("Socket authorization failed.", "WS_UNAUTHORIZED");
    }
}
