import { Link } from "react-router-dom";
import { USER_ROLE } from "@platform/permissions";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ROUTE_PATHS } from "@/routes/route-paths";

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const homePath = user?.role === USER_ROLE.SUPER_ADMIN ? ROUTE_PATHS.SUPER_ADMIN : ROUTE_PATHS.STAFF;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="font-heading text-lg font-medium text-foreground">You don&apos;t have access to this page</h1>
      <p className="text-sm text-muted-foreground">Your account doesn&apos;t have permission to view this portal.</p>
      <Button asChild>
        <Link to={homePath}>Go to your dashboard</Link>
      </Button>
    </div>
  );
}
