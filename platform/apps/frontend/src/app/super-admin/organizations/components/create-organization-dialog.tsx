import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconLoader, IconPlus } from "@/components/icons";
import { useCreateOrganization } from "@/api/super-admin/organizations/create.queries";
import { toast } from "@/lib/toast";
import { getApiErrorMessage } from "@/types/api.types";
import { createOrganizationSchema, type CreateOrganizationValues } from "../organizations.schemas";

export function CreateOrganizationDialog() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<CreateOrganizationValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { hasLiveAttendanceTrigger: false }
  });
  const createOrganization = useCreateOrganization();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createOrganization.mutateAsync({
        name: values.name,
        logoUrl: values.logoUrl || undefined,
        webhookUrl: values.webhookUrl || undefined,
        hasLiveAttendanceTrigger: values.hasLiveAttendanceTrigger
      });
      toast.success("Organization created");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't create the organization"));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconPlus className="size-4" />
          New organization
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Acme University" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" placeholder="https://..." {...register("logoUrl")} />
            {errors.logoUrl && <p className="text-sm text-destructive">{errors.logoUrl.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input id="webhookUrl" placeholder="https://..." {...register("webhookUrl")} />
            {errors.webhookUrl && <p className="text-sm text-destructive">{errors.webhookUrl.message}</p>}
          </div>
          <Controller
            control={control}
            name="hasLiveAttendanceTrigger"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                Live attendance webhook trigger
              </label>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={createOrganization.isPending}>
              {createOrganization.isPending && <IconLoader className="size-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
