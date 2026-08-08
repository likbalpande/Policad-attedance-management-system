import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useOrganizations } from "@/api/super-admin/organizations/list.queries";
import { CreateOrganizationDialog } from "../components/create-organization-dialog";

export default function OrganizationsPage() {
  const { data: organizations, isLoading } = useOrganizations();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-medium text-foreground">Organizations</h1>
        <CreateOrganizationDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Webhook</TableHead>
            <TableHead>Live trigger</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && organizations?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No organizations yet.
              </TableCell>
            </TableRow>
          )}
          {organizations?.map((org) => (
            <TableRow key={org.id}>
              <TableCell className="font-medium text-foreground">{org.name}</TableCell>
              <TableCell className="text-muted-foreground">{org.webhookUrl ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={org.hasLiveAttendanceTrigger ? "default" : "outline"}>
                  {org.hasLiveAttendanceTrigger ? "On" : "Off"}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {new Date(org.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
