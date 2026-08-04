import { organizationsRepository, ORGANIZATIONS_CONSTRAINTS } from "@platform/dal";
import { assertNoUniqueViolation } from "@platform/http";
import type { CreateOrganizationDto } from "../dto/create-organizations.dto";

export async function createOrganization(input: CreateOrganizationDto) {
  try {
    return await organizationsRepository.createOrganization(input);
  } catch (err) {
    assertNoUniqueViolation(err, ORGANIZATIONS_CONSTRAINTS);
    throw err;
  }
}
