import type { Organization } from "@platform/types";
import { pbClient } from "@/lib/pb-client";
import type { ApiSuccessBody } from "@/types/api.types";

export function listOrganizations() {
  return pbClient.get<ApiSuccessBody<Organization[]>>("/super-admin/organizations");
}
