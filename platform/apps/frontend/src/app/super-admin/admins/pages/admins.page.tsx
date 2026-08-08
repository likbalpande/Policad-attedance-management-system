import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useOrganizations } from "@/api/super-admin/organizations/list.queries";
import { useAdmins } from "@/api/super-admin/users/list.queries";
import { CreateAdminDialog } from "../components/create-admin-dialog";

export default function AdminsPage() {
  const { data: admins, isLoading } = useAdmins();
  const { data: organizations } = useOrganizations();
  const orgNameById = new Map(organizations?.map((org) => [org.id, org.name]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-medium text-foreground">Admins</h1>
        <CreateAdminDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Identifier</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Password login</TableHead>
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
          {!isLoading && admins?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No admins yet.
              </TableCell>
            </TableRow>
          )}
          {admins?.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell className="font-medium text-foreground">{admin.identifier}</TableCell>
              <TableCell className="text-muted-foreground">{admin.email}</TableCell>
              <TableCell className="text-muted-foreground">{orgNameById.get(admin.orgId) ?? admin.orgId}</TableCell>
              <TableCell>
                <Badge variant={admin.allowPasswordLogin ? "default" : "outline"}>
                  {admin.allowPasswordLogin ? "Allowed" : "OTP only"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
