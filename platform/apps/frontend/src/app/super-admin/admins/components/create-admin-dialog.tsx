import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconLoader, IconPlus } from "@/components/icons";
import { useOrganizations } from "@/api/super-admin/organizations/list.queries";
import { useCreateAdmin } from "@/api/super-admin/users/create.queries";
import { toast } from "@/lib/toast";
import { getApiErrorMessage } from "@/types/api.types";
import { createAdminSchema, type CreateAdminValues } from "../admins.schemas";

export function CreateAdminDialog() {
  const [open, setOpen] = useState(false);
  const { data: organizations } = useOrganizations();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<CreateAdminValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { allowPasswordLogin: false }
  });
  const createAdmin = useCreateAdmin();

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAdmin.mutateAsync({
        orgId: values.orgId,
        identifier: values.identifier,
        email: values.email,
        phone: values.phone || undefined,
        whatsapp: values.whatsapp || undefined,
        alias: values.alias || undefined,
        allowPasswordLogin: values.allowPasswordLogin
      });
      toast.success("Admin created");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't create the admin"));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconPlus className="size-4" />
          New admin
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New admin</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="orgId">Organization</Label>
            <Controller
              control={control}
              name="orgId"
              render={({ field }) => (
                <Select value={field.value ? String(field.value) : ""} onValueChange={(v) => field.onChange(Number(v))}>
                  <SelectTrigger id="orgId" className="w-full">
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations?.map((org) => (
                      <SelectItem key={org.id} value={String(org.id)}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.orgId && <p className="text-sm text-destructive">{errors.orgId.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="identifier">Identifier</Label>
            <Input id="identifier" placeholder="jane.doe" {...register("identifier")} />
            {errors.identifier && <p className="text-sm text-destructive">{errors.identifier.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="jane@policad.com" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="Optional" {...register("phone")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alias">Alias</Label>
            <Input id="alias" placeholder="Optional" {...register("alias")} />
          </div>
          <Controller
            control={control}
            name="allowPasswordLogin"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                Allow password login (in addition to OTP)
              </label>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={createAdmin.isPending}>
              {createAdmin.isPending && <IconLoader className="size-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
