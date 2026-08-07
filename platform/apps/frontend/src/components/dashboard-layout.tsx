import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { IconLogOut } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";

interface DashboardLayoutProps {
  title: string;
  children: ReactNode;
}

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="font-heading text-sm font-medium text-foreground">{title}</p>
          {user && (
            <p className="font-mono text-xs text-muted-foreground">
              User #{user.userId} · {user.role}
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          <IconLogOut className="size-4" />
          Log out
        </Button>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
