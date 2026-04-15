import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ALLOW_UNVERIFIED_KEY } from "../../common/decorators/decorator.allow-unverified";
import { IS_PUBLIC_KEY } from "../../common/decorators/decorator.public";
import { EmailVerificationRequiredException } from "../../common/global/exception/custom-exceptions/http/EmailVerificationRequiredException";
import { UserManager } from "../user.manager";

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly userManager: UserManager,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (context.getType() !== "http") {
            return true;
        }

        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (isPublic) {
            return true;
        }

        const allowUnverified = this.reflector.getAllAndOverride<boolean>(
            ALLOW_UNVERIFIED_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (allowUnverified) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userId = request.user?.sub;

        if (!userId) {
            return true;
        }

        const user = await this.userManager.getUserByIdOrThrow(userId);

        if (!user.is_verified) {
            throw new EmailVerificationRequiredException();
        }

        return true;
    }
}
