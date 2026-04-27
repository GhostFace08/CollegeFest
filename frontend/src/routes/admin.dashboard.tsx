import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useFest } from "@/lib/fest-context";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { Calendar, CheckCircle, Clock, Users, ClipboardList, DollarSign, QrCode } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({ component: AdminDashboard });

function AdminDashboard() {
  const { events, registrations, loading, refreshEvents } = useFest();
  const { user } = useAuth();

  // BUG 4 FIX: Refresh events on mount so dashboard is never stale
  useEffect(() => { refreshEvents(); }, []);

  // BUG 1 FIX: /events/admin/mine already scopes to this admin — no committee filter needed
  const myEvents = events;
  const approved = myEvents.filter(e => e.status === 'approved').length;
  const pending = myEvents.filter(e => e.status === 'pending').length;
  const totalRegs = registrations.filter(r => myEvents.some(e => e.id === r.eventId)).length;

  const stats = [
    { label: 'My Events', value: myEvents.length, icon: Calendar, color: 'text-primary' },
    { label: 'Approved', value: approved, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending', value: pending, icon: Clock, color: 'text-yellow-600' },
    { label: 'Total Registrations', value: totalRegs, icon: Users, color: 'text-blue-600' },
  ];

  const quickLinks = [
    { label: 'My Events', to: '/admin/events', icon: Calendar },
    { label: 'Volunteers', to: '/admin/volunteers', icon: Users },
    { label: 'Logistics', to: '/admin/logistics', icon: ClipboardList },
    { label: 'Finance & Sponsors', to: '/admin/finance', icon: DollarSign },
    { label: 'QR Scanner', to: '/admin/scanner', icon: QrCode },
  ];

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{user?.committee}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Recent Events</CardTitle></CardHeader>
        <CardContent>
          {myEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No events yet. Create your first event!</p>
          ) : (
            <div className="space-y-3">
              {myEvents.slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.date} • {e.venue}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{e.registeredCount}/{e.capacity}</span>
                    <StatusBadge status={e.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="font-semibold mb-3">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickLinks.map(l => (
            <Link key={l.to} to={l.to as any}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <l.icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">{l.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
