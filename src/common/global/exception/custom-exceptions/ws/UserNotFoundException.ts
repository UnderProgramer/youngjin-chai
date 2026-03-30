import { WsBaseException } from "./WsBaseException";

export class UserNotFoundException extends WsBaseException {
    constructor(userIdentifier: string) {
        super(
            `User ${userIdentifier} not found.`,
            "USER_NOT_FOUND",
        );
    }
}
