export const batchesQueryKey = ["batches"] as const;
export const batchQueryKey = (id: number) => ["batches", id] as const;
