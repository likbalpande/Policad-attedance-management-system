import type { ListAccessIdentifiersDto } from "@platform/types";

export const accessIdentifiersQueryKey = (params?: ListAccessIdentifiersDto) =>
  ["super-admin", "access-identifiers", params ?? {}] as const;
export const accessIdentifiersQueryKeyPrefix = ["super-admin", "access-identifiers"] as const;
