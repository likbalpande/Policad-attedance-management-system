import { DashboardLayout } from "@/components/dashboard-layout";

export default function StaffDashboardPage() {
  return (
    <DashboardLayout title="Staff">
      <p className="text-sm text-muted-foreground">You&apos;re signed in as admin/faculty staff.</p>
    </DashboardLayout>
  );
}
