import { organizationsRepository } from "@platform/dal";
import type { Organization } from "@platform/types";
import { serializeOrganization } from "../utils/serialize-organization";

export async function listOrganizations(): Promise<Organization[]> {
  const organizations = await organizationsRepository.listOrganizations();
  return organizations.map(serializeOrganization);
}
