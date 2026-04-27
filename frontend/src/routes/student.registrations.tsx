import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useFest } from "@/lib/fest-context";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { QRModal } from "@/components/QRModal";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { CalendarDays, MapPin, QrCode, XCircle } from "lucide-react";

export const Route = createFileRoute("/student/registrations")({ component: MyRegistrations });

function MyRegistrations() {
  const { events, registrations, cancelRegistration, refreshRegistrations } = useFest();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrData, setQrData] = useState<{ id: string; eventTitle: string; studentName: string; eventDate: string } | null>(null);

  // BUG 5 FIX: Always refresh registrations from the API on mount.
  // The API GET /registrations/my already returns only THIS student's registrations,
  // so we must not filter by studentId in the frontend — just show everything returned.
  useEffect(() => {
    refreshRegistrations().finally(() => setLoading(false));
  }, []);

  // BUG 5 FIX: Do NOT filter by studentId. The endpoint /api/registrations/my
  // is authenticated and returns only the logged-in student's registrations.
  // Filtering by user.id here caused the empty list because the id field
  // stored in normalizeReg (studentId) may not match user.id from localStorage.
  const myRegs = registrations;

  const confirmed = myRegs.filter(r => r.status === 'confirmed').length;
  const attended = myRegs.filter(r => r.status === 'attended').length;

  const handleCancel = async (id: string) => {
    await cancelRegistration(id);
    toast.success('Registration cancelled');
  };

  if (loading) return (
    <div className="p-6 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Registrations</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your event registrations</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {([
          ['Total', myRegs.length, 'bg-primary/10 text-primary'],
          ['Confirmed', confirmed, 'bg-green-50 text-green-700'],
          ['Attended', attended, 'bg-blue-50 text-blue-700'],
        ] as [string, number, string][]).map(([label, count, cls]) => (
          <Card key={label}>
            <CardContent className={`p-4 text-center ${cls} rounded-lg`}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {myRegs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">You haven't registered for any events yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myRegs.map(reg => {
            // eventId comes from normalizeReg which extracts reg.event._id
            const event = events.find(e => e.id === reg.eventId);
            if (!event) return null;
            return (
              <Card key={reg.id} className="border-border/60">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <StatusBadge status={reg.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{event.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.venue}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Registration ID: {reg.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {reg.status !== 'cancelled' && (
                      <Button
                        size="sm" variant="outline"
                        onClick={() => {
                          setQrData({ id: reg.id, eventTitle: event.title, studentName: user?.name || '', eventDate: event.date });
                          setQrOpen(true);
                        }}
                      >
                        <QrCode className="h-3.5 w-3.5 mr-1" /> View QR
                      </Button>
                    )}
                    {reg.status === 'confirmed' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
                            <AlertDialogDescription>This will cancel your registration for {event.title}.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCancel(reg.id)}>Cancel Registration</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <QRModal open={qrOpen} onOpenChange={setQrOpen} data={qrData} />
    </div>
  );
}
