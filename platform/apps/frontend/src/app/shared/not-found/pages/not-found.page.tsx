import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTE_PATHS } from "@/routes/route-paths";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="font-heading text-lg font-medium text-foreground">Page not found</h1>
      <Button asChild>
        <Link to={ROUTE_PATHS.LOGIN}>Back to sign in</Link>
      </Button>
    </div>
  );
}
