import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { AppSidebar } from "@/components/AppSidebar";

export const Route = createFileRoute("/superadmin")({ component: SuperAdminLayout });

function SuperAdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && (!user || user.role !== 'superadmin')) navigate({ to: '/' }); }, [user, loading, navigate]);
  if (loading || !user || user.role !== 'superadmin') return <div className="min-h-screen bg-background" />;
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar role="superadmin" />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-6 pt-16 lg:pt-6"><Outlet /></div>
      </main>
    </div>
  );
}
