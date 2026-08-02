import { usersRepository } from "@platform/dal";
import { NotFoundError } from "@platform/http";
import { USER_ROLE } from "@platform/permissions";
import { generateOtp } from "../../../utils/generate-otp";
import { sendOtpEmail } from "../../../utils/send-otp-email";

export async function requestOtp(email: string): Promise<void> {
    const user = await usersRepository.findUserByEmail(email);
    if (!user || user.role === USER_ROLE.STUDENT) {
        throw new NotFoundError("No account found for this email");
    }

    const otp = generateOtp();
    await usersRepository.setUserOtp(user.id, otp, new Date());
    await sendOtpEmail(email, otp);
}
