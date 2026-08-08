import { organizationsRepository, ORGANIZATIONS_CONSTRAINTS } from "@platform/dal";
import { assertNoUniqueViolation } from "@platform/http";
import type { CreateOrganizationDto, Organization } from "@platform/types";
import { serializeOrganization } from "../utils/serialize-organization";

export async function createOrganization(input: CreateOrganizationDto): Promise<Organization> {
  try {
    const organization = await organizationsRepository.createOrganization(input);
    return serializeOrganization(organization);
  } catch (err) {
    assertNoUniqueViolation(err, ORGANIZATIONS_CONSTRAINTS);
    throw err;
  }
}
