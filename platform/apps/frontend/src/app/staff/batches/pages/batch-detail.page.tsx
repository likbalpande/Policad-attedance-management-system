import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { USER_ROLE } from "@platform/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { IconArrowLeft, IconLoader, IconTrash } from "@/components/icons";
import { useBatch } from "@/api/batches/get.queries";
import { useUpdateBatch } from "@/api/batches/update.queries";
import { useDeleteBatch } from "@/api/batches/delete.queries";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTE_PATHS } from "@/routes/route-paths";
import { toast } from "@/lib/toast";
import { getApiErrorMessage } from "@/types/api.types";
import { updateBatchSchema, type UpdateBatchValues } from "../batches.schemas";

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const batchId = Number(id);
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const canDelete = role === USER_ROLE.ADMIN || role === USER_ROLE.SUPER_ADMIN;

  const { data: batch, isLoading } = useBatch(batchId);
  const updateBatch = useUpdateBatch(batchId);
  const deleteBatch = useDeleteBatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<UpdateBatchValues>({ resolver: zodResolver(updateBatchSchema) });

  useEffect(() => {
    if (batch) {
      reset({ title: batch.title, alias: batch.alias ?? "" });
    }
  }, [batch, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateBatch.mutateAsync({ title: values.title, alias: values.alias || undefined });
      toast.success("Batch updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't update the batch"));
    }
  });

  const toggleArchive = async () => {
    if (!batch) return;
    try {
      await updateBatch.mutateAsync({ isArchived: !batch.isArchived });
      toast.success(batch.isArchived ? "Batch unarchived" : "Batch archived");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't change archive status"));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBatch.mutateAsync(batchId);
      toast.success("Batch deleted");
      navigate(ROUTE_PATHS.STAFF_BATCHES);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't delete the batch"));
    }
  };

  if (isLoading || !batch) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Button variant="ghost" size="sm" className="w-fit" onClick={() => navigate(ROUTE_PATHS.STAFF_BATCHES)}>
        <IconArrowLeft className="size-3.5" />
        Back to batches
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-medium text-foreground">{batch.title}</h1>
        <Badge variant={batch.isArchived ? "outline" : "default"}>{batch.isArchived ? "Archived" : "Active"}</Badge>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="alias">Alias</Label>
          <Input id="alias" {...register("alias")} />
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={updateBatch.isPending}>
            {updateBatch.isPending && <IconLoader className="size-4 animate-spin" />}
            Save changes
          </Button>
          <Button type="button" variant="outline" onClick={toggleArchive} disabled={updateBatch.isPending}>
            {batch.isArchived ? "Unarchive" : "Archive"}
          </Button>
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" className="ml-auto">
                  <IconTrash className="size-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this batch?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This can&apos;t be undone. Students and course links to this batch will no longer resolve.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-sm font-medium text-foreground">Access roster</h2>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Admins</p>
          <div className="flex flex-wrap gap-1.5">
            {batch.access.admins.map((admin) => (
              <Badge key={admin.id} variant="outline">
                {admin.alias ?? admin.identifier}
              </Badge>
            ))}
            {batch.access.admins.length === 0 && <p className="text-sm text-muted-foreground">No admins in this org.</p>}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">Faculty</p>
          <div className="flex flex-wrap gap-1.5">
            {batch.access.faculties.map((faculty) => (
              <Badge key={faculty.id} variant={faculty.canEdit ? "default" : "outline"}>
                {faculty.alias ?? faculty.identifier} {faculty.canEdit ? "· can edit" : ""}
              </Badge>
            ))}
            {batch.access.faculties.length === 0 && (
              <p className="text-sm text-muted-foreground">No faculty in this org.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
