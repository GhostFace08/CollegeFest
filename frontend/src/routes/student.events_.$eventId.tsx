import { createFileRoute, Link } from "@tanstack/react-router";
import { useFest } from "@/lib/fest-context";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge, StatusBadge } from "@/components/StatusBadge";
import { QRModal } from "@/components/QRModal";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Clock, Users, IndianRupee, CalendarDays, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/student/events_/$eventId")({ component: EventDetail });

function EventDetail() {
  const { eventId } = Route.useParams();
  const { events, registrations, registerForEvent } = useFest();
  const { user } = useAuth();
  const [qrOpen, setQrOpen] = useState(false);

  const event = events.find(e => e.id === eventId);
  if (!event) return <div className="p-6 text-center"><p className="text-muted-foreground">Event not found.</p><Link to="/student/events" className="text-primary underline mt-2 inline-block">Back to events</Link></div>;

  const myReg = registrations.find(r => r.eventId === eventId && r.studentId === user?.id && r.status !== 'cancelled');
  const seatsLeft = event.capacity - event.registeredCount;
  const pct = (event.registeredCount / event.capacity) * 100;
  const canRegister = !myReg && seatsLeft > 0 && !event.isPast;

  const handleRegister = () => {
    if (!user) return;
    registerForEvent(eventId, { id: user.id, name: user.name, email: user.email });
    toast.success(`Registered for ${event.title}!`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link to="/student/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2"><CategoryBadge category={event.category} /><StatusBadge status={event.status} /></div>
            </div>
            {myReg ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm font-medium text-green-700"><CheckCircle className="h-4 w-4" />Registered</span>
                <Button size="sm" variant="outline" onClick={() => setQrOpen(true)}>View QR</Button>
              </div>
            ) : canRegister ? (
              <Button onClick={handleRegister}>Register Now</Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-muted-foreground">{event.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /><span>{event.date}</span></div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>{event.time}</span></div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{event.venue}</span></div>
            <div className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-muted-foreground" /><span>{event.entryFee === 0 ? 'Free Entry' : `₹${event.entryFee}`}</span></div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span>{event.committee}</span></div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5"><span className="font-medium">{event.registeredCount} / {event.capacity} registered</span><span className="text-muted-foreground">{seatsLeft} seats left</span></div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
          </div>
          {event.isPast && <p className="text-sm text-muted-foreground italic">This event has already taken place.</p>}
        </CardContent>
      </Card>

      {myReg && <QRModal open={qrOpen} onOpenChange={setQrOpen} data={{ id: myReg.id, eventTitle: event.title, studentName: user?.name || '', eventDate: event.date }} />}
    </div>
  );
}
