import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { AppSidebar } from "@/components/AppSidebar";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && (!user || user.role !== 'admin')) navigate({ to: '/' }); }, [user, loading, navigate]);
  if (loading || !user || user.role !== 'admin') return <div className="min-h-screen bg-background" />;
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar role="admin" />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-6 pt-16 lg:pt-6"><Outlet /></div>
      </main>
    </div>
  );
}
