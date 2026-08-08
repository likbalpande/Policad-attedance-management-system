import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconLogOut } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";

export interface AppShellNavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

interface AppShellProps {
  title: string;
  navItems: AppShellNavItem[];
}

export function AppShell({ title, navItems }: AppShellProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border">
        <div className="px-4 py-4">
          <p className="font-heading text-sm font-medium text-foreground">{title}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  isActive && "bg-muted text-accent"
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          {user && (
            <p className="font-mono text-xs text-muted-foreground">
              User #{user.userId} · {user.role}
            </p>
          )}
          <Button variant="ghost" size="sm" onClick={logout}>
            <IconLogOut className="size-4" />
            Log out
          </Button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
