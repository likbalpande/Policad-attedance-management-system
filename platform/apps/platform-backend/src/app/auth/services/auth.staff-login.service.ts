import { usersRepository } from "@platform/dal";
import { UnauthorizedError } from "@platform/http";
import { USER_ROLE } from "@platform/permissions";
import { env } from "../../../config/env.config";
import { issueStaffTokens } from "./auth.tokens.service";

export async function staffLogin(
    email: string,
    code: string,
    userAgent: string
): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await usersRepository.findUserByEmail(email);
    if (!user || user.role === USER_ROLE.STUDENT) throw new UnauthorizedError("Invalid credentials");

    const otpValid =
        user.otp !== null &&
        user.otp === code &&
        user.otpGeneratedAt !== null &&
        Date.now() - user.otpGeneratedAt.getTime() <= env.OTP_TTL_SECONDS * 1000;

    const passwordValid = !otpValid && user.allowPasswordLogin && user.password !== null && user.password === code;

    if (!otpValid && !passwordValid) {
        throw new UnauthorizedError("Invalid credentials");
    }

    await usersRepository.clearUserOtp(user.id);
    const loginCount = await usersRepository.incrementLoginCount(user.id);

    return issueStaffTokens({
        userId: user.id,
        orgId: user.orgId,
        role: user.role,
        loginCount,
        userAgent,
    });
}
