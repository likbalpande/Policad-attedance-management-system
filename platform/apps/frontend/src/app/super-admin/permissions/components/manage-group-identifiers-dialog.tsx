import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconLoader, IconTrash } from "@/components/icons";
import { useAccessIdentifiers } from "@/api/super-admin/access-identifiers/list.queries";
import { useAddAccessIdentifiersToGroup } from "@/api/super-admin/permission-config-groups/add-access-identifiers.queries";
import { useRemoveAccessIdentifierFromGroup } from "@/api/super-admin/permission-config-groups/remove-access-identifier.queries";
import type { PermissionConfigGroup } from "@platform/types";
import { toast } from "@/lib/toast";
import { getApiErrorMessage } from "@/types/api.types";

interface ManageGroupIdentifiersDialogProps {
  group: PermissionConfigGroup;
}

export function ManageGroupIdentifiersDialog({ group }: ManageGroupIdentifiersDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { data: attached, isLoading: isLoadingAttached } = useAccessIdentifiers({
    permissionConfigGroupId: group.id
  });
  const { data: allOfType } = useAccessIdentifiers({ type: group.type });
  const attachMutation = useAddAccessIdentifiersToGroup();
  const removeMutation = useRemoveAccessIdentifierFromGroup();

  const attachedIds = new Set(attached?.map((identifier) => identifier.id));
  const available = allOfType?.filter((identifier) => !attachedIds.has(identifier.id)) ?? [];

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAttach = async () => {
    if (selectedIds.length === 0) return;
    try {
      await attachMutation.mutateAsync({ groupId: group.id, accessIdentifierIds: selectedIds });
      toast.success("Access identifiers attached");
      setSelectedIds([]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't attach the selected identifiers"));
    }
  };

  const handleRemove = async (accessIdentifierId: number) => {
    try {
      await removeMutation.mutateAsync({ groupId: group.id, accessIdentifierId });
      toast.success("Access identifier removed");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't remove that identifier"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Manage identifiers
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{group.title} — access identifiers</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">Attached</p>
            {isLoadingAttached && <p className="text-sm text-muted-foreground">Loading...</p>}
            {!isLoadingAttached && attached?.length === 0 && (
              <p className="text-sm text-muted-foreground">No identifiers attached yet.</p>
            )}
            <div className="flex flex-col gap-1">
              {attached?.map((identifier) => (
                <div key={identifier.id} className="flex items-center justify-between rounded-md border border-border px-2.5 py-1.5">
                  <div>
                    <p className="text-sm text-foreground">{identifier.identifier}</p>
                    <p className="text-xs text-muted-foreground">{identifier.description}</p>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={removeMutation.isPending}
                    onClick={() => handleRemove(identifier.id)}
                  >
                    <IconTrash className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Available <Badge variant="outline">{group.type}</Badge>
            </p>
            {available.length === 0 && <p className="text-sm text-muted-foreground">Nothing left to attach.</p>}
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
              {available.map((identifier) => (
                <label
                  key={identifier.id}
                  className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm text-foreground"
                >
                  <Checkbox
                    checked={selectedIds.includes(identifier.id)}
                    onCheckedChange={() => toggleSelected(identifier.id)}
                  />
                  {identifier.identifier}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAttach} disabled={selectedIds.length === 0 || attachMutation.isPending}>
            {attachMutation.isPending && <IconLoader className="size-4 animate-spin" />}
            Attach selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
