import type { CreateOrganizationDto, Organization } from "@platform/types";
import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function createOrganization(input: CreateOrganizationDto) {
  return pbClient.post<ApiSuccessBody<Organization>>("/super-admin/organizations", input);
}
