import { accessIdentifiersRepository } from "@platform/dal";
import type { ListAccessIdentifiersDto } from "../dto/list-access-identifiers.dto";

export async function listAccessIdentifiers(input: ListAccessIdentifiersDto) {
  return accessIdentifiersRepository.listAccessIdentifiers(input.type);
}
