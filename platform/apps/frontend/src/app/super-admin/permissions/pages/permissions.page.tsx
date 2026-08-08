import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAccessIdentifiers } from "@/api/super-admin/access-identifiers/list.queries";
import { usePermissionConfigGroups } from "@/api/super-admin/permission-config-groups/list.queries";
import { CreateAccessIdentifierDialog } from "../components/create-access-identifier-dialog";
import { CreatePermissionConfigGroupDialog } from "../components/create-permission-config-group-dialog";
import { ManageGroupIdentifiersDialog } from "../components/manage-group-identifiers-dialog";

export default function PermissionsPage() {
  const { data: accessIdentifiers, isLoading: isLoadingIdentifiers } = useAccessIdentifiers();
  const { data: groups, isLoading: isLoadingGroups } = usePermissionConfigGroups();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-lg font-medium text-foreground">Access identifiers</h1>
          <CreateAccessIdentifierDialog />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identifier</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Scope</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingIdentifiers && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoadingIdentifiers && accessIdentifiers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No access identifiers yet.
                </TableCell>
              </TableRow>
            )}
            {accessIdentifiers?.map((identifier) => (
              <TableRow key={identifier.id}>
                <TableCell className="font-mono text-xs text-foreground">{identifier.identifier}</TableCell>
                <TableCell className="text-muted-foreground">{identifier.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{identifier.type}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-lg font-medium text-foreground">Permission config groups</h1>
          <CreatePermissionConfigGroupDialog />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead className="text-right">Identifiers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingGroups && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoadingGroups && groups?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No permission config groups yet.
                </TableCell>
              </TableRow>
            )}
            {groups?.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium text-foreground">{group.title}</TableCell>
                <TableCell className="text-muted-foreground">{group.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{group.type}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ManageGroupIdentifiersDialog group={group} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
