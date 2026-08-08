import { accessIdentifiersRepository, ADMIN_ACCESS_IDENTIFIERS_CONSTRAINTS } from "@platform/dal";
import { assertNoUniqueViolation } from "@platform/http";
import type { AccessIdentifier, CreateAccessIdentifierDto } from "@platform/types";
import { serializeAccessIdentifier } from "../utils/serialize-access-identifier";

export async function createAccessIdentifier(input: CreateAccessIdentifierDto): Promise<AccessIdentifier> {
  try {
    const accessIdentifier = await accessIdentifiersRepository.createAccessIdentifier(input);
    return serializeAccessIdentifier(accessIdentifier);
  } catch (err) {
    assertNoUniqueViolation(err, ADMIN_ACCESS_IDENTIFIERS_CONSTRAINTS);
    throw err;
  }
}
