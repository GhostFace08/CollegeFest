import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useFest } from "@/lib/fest-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Clock, Users, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/student/events")({ component: StudentEvents });

const tabs = ['All', 'Technical', 'Cultural', 'Sports', 'Other'] as const;

function StudentEvents() {
  const { events } = useFest();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<string>('All');

  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

  const approved = events.filter(e => e.status === 'approved');
  const filtered = approved.filter(e => {
    const matchesTab = tab === 'All' || e.category === tab.toLowerCase();
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Browse Events</h1>
        <p className="text-muted-foreground text-sm mt-1">Discover and register for exciting events</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {tabs.map(t => (
            <Button key={t} size="sm" variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)}>{t}</Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No events found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(event => {
            const seatsLeft = event.capacity - event.registeredCount;
            const pct = (event.registeredCount / event.capacity) * 100;
            return (
              <Link key={event.id} to="/student/events/$eventId" params={{ eventId: event.id }} className="group">
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-border/60 relative overflow-hidden">
                  {event.isPast && (
                    <div className="absolute inset-0 bg-background/70 z-10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">Past Event</span>
                    </div>
                  )}
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                      <CategoryBadge category={event.category} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{event.date} • {event.time}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{event.venue}</div>
                      <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{seatsLeft} seats left</div>
                      <div className="flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5" />{event.entryFee === 0 ? 'Free' : `₹${event.entryFee}`}</div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span>{event.registeredCount} registered</span><span>{event.capacity} capacity</span></div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
