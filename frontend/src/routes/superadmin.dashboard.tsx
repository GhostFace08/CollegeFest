import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useFest } from "@/lib/fest-context";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, UserCheck, Clock, AlertTriangle, Building2, Shield } from "lucide-react";

export const Route = createFileRoute("/superadmin/dashboard")({ component: SuperadminDashboard });

function SuperadminDashboard() {
  const { events, registrations, admins, committees } = useFest();
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

  const pendingAdmins = admins.filter(a => a.status === 'pending').length;
  const pendingEvents = events.filter(e => e.status === 'pending').length;
  const activeAdmins = admins.filter(a => a.status === 'approved').length;

  const stats = [
    { label: 'Total Events', value: events.length, icon: Calendar, to: '/superadmin/approvals', color: '' },
    { label: 'Total Registrations', value: registrations.length, icon: Users, to: '/superadmin/approvals', color: '' },
    { label: 'Active Admins', value: activeAdmins, icon: UserCheck, to: '/superadmin/admins', color: '' },
    { label: 'Pending Admins', value: pendingAdmins, icon: Clock, to: '/superadmin/admins', color: pendingAdmins > 0 ? 'ring-2 ring-yellow-400 bg-yellow-50' : '' },
    { label: 'Pending Events', value: pendingEvents, icon: AlertTriangle, to: '/superadmin/approvals', color: pendingEvents > 0 ? 'ring-2 ring-orange-400 bg-orange-50' : '' },
  ];

  if (loading) return <div className="p-6"><div className="grid grid-cols-2 lg:grid-cols-5 gap-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div></div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <Link key={s.label} to={s.to as any}>
            <Card className={`hover:shadow-md transition-shadow cursor-pointer ${s.color}`}>
              <CardContent className="p-4"><s.icon className="h-6 w-6 text-primary mb-2" /><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {pendingAdmins > 0 && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Clock className="h-5 w-5 text-yellow-600" />
          <p className="text-sm"><strong>{pendingAdmins} admin{pendingAdmins > 1 ? 's' : ''}</strong> awaiting approval</p>
          <Link to="/superadmin/admins" className="ml-auto text-sm text-primary font-medium hover:underline">Review →</Link>
        </div>
      )}
      {pendingEvents > 0 && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <p className="text-sm"><strong>{pendingEvents} event{pendingEvents > 1 ? 's' : ''}</strong> awaiting approval</p>
          <Link to="/superadmin/approvals" className="ml-auto text-sm text-primary font-medium hover:underline">Review →</Link>
        </div>
      )}

      <div>
        <h2 className="font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[{ label: 'Manage Committees', to: '/superadmin/committees', icon: Building2 }, { label: 'Approve Events', to: '/superadmin/approvals', icon: Shield }, { label: 'Manage Admins', to: '/superadmin/admins', icon: UserCheck }].map(l => (
            <Link key={l.to} to={l.to as any}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4 flex items-center gap-3"><l.icon className="h-5 w-5 text-primary" /><span className="font-medium text-sm">{l.label}</span></CardContent></Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Committees Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {committees.map(c => {
            const cAdmins = admins.filter(a => c.adminIds.includes(a.id) && a.status === 'approved');
            const cEvents = events.filter(e => e.committee === c.name);
            return (
              <Card key={c.id}><CardContent className="p-4"><h3 className="font-semibold text-sm">{c.name}</h3><div className="mt-2 space-y-1 text-xs text-muted-foreground"><p>{cAdmins.length} admin{cAdmins.length !== 1 ? 's' : ''}</p><p>{cEvents.length} event{cEvents.length !== 1 ? 's' : ''}</p></div></CardContent></Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
