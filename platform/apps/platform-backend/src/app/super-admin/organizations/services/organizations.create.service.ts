import { organizationsRepository, ORGANIZATIONS_CONSTRAINTS } from "@platform/dal";
import { ConflictError, getUniqueViolationConstraint } from "@platform/http";
import type { CreateOrganizationDto } from "../dto/create-organizations.dto";

export async function createOrganization(input: CreateOrganizationDto) {
  try {
    return await organizationsRepository.createOrganization(input);
  } catch (err) {
    if (getUniqueViolationConstraint(err) === ORGANIZATIONS_CONSTRAINTS.UQ_NAME) {
      throw new ConflictError("An organization with this name already exists");
    }
    throw err;
  }
}
