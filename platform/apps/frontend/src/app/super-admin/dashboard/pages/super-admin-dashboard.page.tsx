import { DashboardLayout } from "@/components/dashboard-layout";

export default function SuperAdminDashboardPage() {
  return (
    <DashboardLayout title="Super Admin">
      <p className="text-sm text-muted-foreground">You&apos;re signed in as a super admin.</p>
    </DashboardLayout>
  );
}
