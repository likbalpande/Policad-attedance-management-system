import { organizationsRepository } from "@platform/dal";

export async function listOrganizations() {
  return organizationsRepository.listOrganizations();
}
