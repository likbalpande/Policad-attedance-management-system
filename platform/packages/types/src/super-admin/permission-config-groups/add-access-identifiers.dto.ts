import { z } from "zod";

export const addAccessIdentifiersDto = z.object({
  accessIdentifierIds: z.array(z.number().int().positive()).min(1)
});

export type AddAccessIdentifiersDto = z.infer<typeof addAccessIdentifiersDto>;
