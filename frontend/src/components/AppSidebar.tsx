import { useState } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useAuth, type UserRole } from '@/lib/auth';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LayoutDashboard, Calendar, Users, ClipboardList, DollarSign, QrCode, User, LogOut, Shield, Building2, UserCheck } from 'lucide-react';

interface NavItem { label: string; to: string; icon: React.ComponentType<{ className?: string }>; }

const navMap: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Browse Events', to: '/student/events', icon: Calendar },
    { label: 'My Registrations', to: '/student/registrations', icon: ClipboardList },
    { label: 'Profile', to: '/student/profile', icon: User },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'My Events', to: '/admin/events', icon: Calendar },
    { label: 'Volunteers', to: '/admin/volunteers', icon: Users },
    { label: 'Logistics', to: '/admin/logistics', icon: ClipboardList },
    { label: 'Finance & Sponsors', to: '/admin/finance', icon: DollarSign },
    { label: 'QR Scanner', to: '/admin/scanner', icon: QrCode },
  ],
  superadmin: [
    { label: 'Dashboard', to: '/superadmin/dashboard', icon: LayoutDashboard },
    { label: 'Committees', to: '/superadmin/committees', icon: Building2 },
    { label: 'Admin Management', to: '/superadmin/admins', icon: UserCheck },
    { label: 'Event Approvals', to: '/superadmin/approvals', icon: Shield },
  ],
};

export function AppSidebar({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const items = navMap[role];

  const handleLogout = () => { logout(); navigate({ to: '/' }); };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-border">
        <h1 className="text-xl font-bold text-primary tracking-tight">CollegeFest</h1>
      </div>
      <div className="px-4 py-4 border-b border-border">
        <p className="font-semibold text-sm text-foreground truncate">{user?.name}</p>
        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        {user?.committee && <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">{user.committee}</span>}
        {role === 'superadmin' && <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">Super Admin</span>}
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {items.map(item => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="h-4.5 w-4.5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-card shadow-md h-9 w-9">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0"><NavContent /></SheetContent>
        </Sheet>
      </div>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border z-30">
        <NavContent />
      </aside>
    </>
  );
}
