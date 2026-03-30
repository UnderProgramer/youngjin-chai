import { WsBaseException } from "./WsBaseException";

export class MessageRequiredException extends WsBaseException {
    constructor() {
        super("Message is required.", "MESSAGE_REQUIRED");
    }
}
