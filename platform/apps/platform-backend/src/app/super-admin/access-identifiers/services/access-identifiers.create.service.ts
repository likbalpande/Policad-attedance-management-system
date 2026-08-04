import { accessIdentifiersRepository, ADMIN_ACCESS_IDENTIFIERS_CONSTRAINTS } from "@platform/dal";
import { assertNoUniqueViolation } from "@platform/http";
import type { CreateAccessIdentifierDto } from "../dto/create-access-identifier.dto";

export async function createAccessIdentifier(input: CreateAccessIdentifierDto) {
  try {
    return await accessIdentifiersRepository.createAccessIdentifier(input);
  } catch (err) {
    assertNoUniqueViolation(err, ADMIN_ACCESS_IDENTIFIERS_CONSTRAINTS);
    throw err;
  }
}
