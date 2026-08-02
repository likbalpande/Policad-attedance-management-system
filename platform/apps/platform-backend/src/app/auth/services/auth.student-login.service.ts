import { usersRepository } from "@platform/dal";
import { UnauthorizedError } from "@platform/http";
import { USER_ROLE } from "@platform/permissions";
import { generateHardPassword } from "../../../utils/generate-hard-password";
import { issueStudentTokens } from "./auth.tokens.service";

export async function studentLogin(
  identifier: string,
  orgId: number,
  password: string,
  userAgent: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const user = await usersRepository.findUserByIdentifierAndOrg(identifier, orgId);
  if (!user || user.role !== USER_ROLE.STUDENT) {
    throw new UnauthorizedError("Invalid credentials");
  }
  if (user.password === null || user.password !== password) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // The password just used is burned and replaced with a random one nobody
  // knows, in the same atomic update that bumps loginCount and stamps
  // lastLoginAt. See product-idea.txt's student login section.
  const result = await usersRepository.rotateStudentPasswordOnLogin(
    user.id,
    generateHardPassword(),
  );
  if (!result) throw new UnauthorizedError("Invalid credentials");

  return issueStudentTokens({
    userId: user.id,
    orgId: user.orgId,
    loginCount: result.loginCount,
    userAgent,
  });
}
