import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useBatches } from "@/api/batches/list.queries";
import { ROUTE_PATHS } from "@/routes/route-paths";
import { CreateBatchDialog } from "../components/create-batch-dialog";

export default function BatchesPage() {
  const { data: batches, isLoading } = useBatches();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-medium text-foreground">Batches</h1>
        <CreateBatchDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Alias</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && batches?.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No batches yet.
              </TableCell>
            </TableRow>
          )}
          {batches?.map((batch) => (
            <TableRow key={batch.id} className="cursor-pointer">
              <TableCell className="font-medium text-foreground">
                <Link to={ROUTE_PATHS.staffBatchDetail(batch.id)} className="hover:text-accent">
                  {batch.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{batch.alias ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={batch.isArchived ? "outline" : "default"}>
                  {batch.isArchived ? "Archived" : "Active"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
