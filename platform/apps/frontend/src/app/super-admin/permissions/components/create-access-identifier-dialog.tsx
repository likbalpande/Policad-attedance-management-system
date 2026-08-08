import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PERMISSION_SCOPE } from "@platform/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconLoader, IconPlus } from "@/components/icons";
import { useCreateAccessIdentifier } from "@/api/super-admin/access-identifiers/create.queries";
import { toast } from "@/lib/toast";
import { getApiErrorMessage } from "@/types/api.types";
import { createAccessIdentifierSchema, type CreateAccessIdentifierValues } from "../permissions.schemas";

export function CreateAccessIdentifierDialog() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<CreateAccessIdentifierValues>({ resolver: zodResolver(createAccessIdentifierSchema) });
  const createAccessIdentifier = useCreateAccessIdentifier();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAccessIdentifier.mutateAsync(values);
      toast.success("Access identifier created");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't create the access identifier"));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <IconPlus className="size-4" />
          New access identifier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New access identifier</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="identifier">Identifier</Label>
            <Input id="identifier" placeholder="BATCH_UPDATE" {...register("identifier")} />
            {errors.identifier && <p className="text-sm text-destructive">{errors.identifier.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Update a batch" {...register("description")} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="type">Scope</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select a scope" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PERMISSION_SCOPE).map((scope) => (
                      <SelectItem key={scope} value={scope}>
                        {scope}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createAccessIdentifier.isPending}>
              {createAccessIdentifier.isPending && <IconLoader className="size-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
