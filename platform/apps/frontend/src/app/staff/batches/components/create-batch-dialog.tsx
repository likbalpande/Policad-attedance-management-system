import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconLoader, IconPlus } from "@/components/icons";
import { useCreateBatch } from "@/api/batches/create.queries";
import { toast } from "@/lib/toast";
import { getApiErrorMessage } from "@/types/api.types";
import { createBatchSchema, type CreateBatchValues } from "../batches.schemas";

export function CreateBatchDialog() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateBatchValues>({ resolver: zodResolver(createBatchSchema) });
  const createBatch = useCreateBatch();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createBatch.mutateAsync({ title: values.title, alias: values.alias || undefined });
      toast.success("Batch created");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't create the batch"));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconPlus className="size-4" />
          New batch
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New batch</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="2026 Batch A" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alias">Alias</Label>
            <Input id="alias" placeholder="Optional" {...register("alias")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createBatch.isPending}>
              {createBatch.isPending && <IconLoader className="size-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
