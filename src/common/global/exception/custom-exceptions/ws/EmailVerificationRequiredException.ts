import { WsBaseException } from "./WsBaseException";

export class EmailVerificationRequiredException extends WsBaseException {
    constructor() {
        super(
            "Email verification is required to access this content.",
            "EMAIL_VERIFICATION_REQUIRED",
        );
    }
}
