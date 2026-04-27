import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useFest } from "@/lib/fest-context";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, CategoryBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, LayoutDashboard, MapPin, Clock, Users, AlertCircle } from "lucide-react";
import type { FestEvent, EventCategory } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/events")({ component: AdminEvents });

const emptyForm = {
  title: '',
  description: '',
  category: 'technical' as EventCategory,
  date: '',
  time: '',
  venue: '',
  capacity: 100,
  entryFee: 0,
};

function AdminEvents() {
  const {
    events, registrations, volunteers, assignments, sponsors, logistics,
    createEvent, updateEvent, deleteEvent, submitEventForApproval, refreshEvents,
  } = useFest();
  const { user } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);
  const [dashEvent, setDashEvent] = useState<FestEvent | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // BUG 1 FIX: /events/admin/mine already returns only this admin's events.
  // Do NOT re-filter by committee name — that was causing the empty list.
  const myEvents = events;

  // BUG 4 FIX: Ensure events are fresh on mount
  useEffect(() => { refreshEvents(); }, []);

  const grouped: Record<string, FestEvent[]> = { approved: [], pending: [], draft: [], rejected: [] };
  myEvents.forEach(e => { if (grouped[e.status]) grouped[e.status].push(e); });

  const openCreate = () => { setEditId(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (e: FestEvent) => {
    setEditId(e.id);
    setForm({ title: e.title, description: e.description, category: e.category, date: e.date, time: e.time, venue: e.venue, capacity: e.capacity, entryFee: e.entryFee });
    setFormOpen(true);
  };
  const openDash = (e: FestEvent) => { setDashEvent(e); setDashOpen(true); };

  const handleSave = async () => {
    if (!form.title || !form.date || !form.venue) { toast.error('Please fill required fields'); return; }

    if (editId) {
      await updateEvent(editId, form);
      toast.success('Event updated');
    } else {
      // BUG 3 FIX: Send committee as MongoDB ObjectId (_id), not the name string.
      // user.committees[0]._id is the ObjectId; user.committee is just the display name.
      const committeeId = user?.committees?.[0]?._id || '';
      if (!committeeId) {
        toast.error('No committee assigned to your account');
        return;
      }
      await createEvent({
        ...form,
        committee: committeeId,        // ObjectId — what the backend schema expects
        status: 'draft',
        isPast: false,
        registeredCount: 0,
        createdBy: user?.id || '',
      });
      toast.success('Event created');
      // BUG 3 FIX: Refresh so the new event appears on both admin and superadmin sides
      await refreshEvents();
    }
    setFormOpen(false);
  };

  const eventRegs = dashEvent ? registrations.filter(r => r.eventId === dashEvent.id) : [];
  const eventVols = dashEvent
    ? assignments.filter(a => a.eventId === dashEvent.id).map(a => ({ ...a, vol: volunteers.find(v => v.id === a.volunteerId) }))
    : [];
  const eventLog = dashEvent ? logistics.find(l => l.eventId === dashEvent.id) : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Events</h1>
          <p className="text-sm text-muted-foreground">{user?.committee}</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New Event</Button>
      </div>

      {myEvents.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No events yet. Create your first event!</p>
        </div>
      )}

      {(['approved', 'pending', 'draft', 'rejected'] as const).map(status => {
        const items = grouped[status];
        if (!items?.length) return null;
        return (
          <div key={status}>
            <h2 className="font-semibold capitalize mb-3 flex items-center gap-2">
              <StatusBadge status={status} /><span>({items.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(e => (
                <Card key={e.id} className="group border-border/60 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{e.title}</h3>
                      <CategoryBadge category={e.category} />
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{e.date} • {e.time}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{e.venue}</div>
                      <div className="flex items-center gap-1.5"><Users className="h-3 w-3" />{e.registeredCount}/{e.capacity} registered</div>
                    </div>
                    {e.rejectionNote && (
                      <div className="flex items-start gap-1.5 text-xs text-destructive bg-destructive/5 p-2 rounded">
                        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />{e.rejectionNote}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(e)}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => openDash(e)}><LayoutDashboard className="h-3 w-3 mr-1" />Dashboard</Button>
                      {e.status === 'draft' && (
                        <Button size="sm" onClick={() => { submitEventForApproval(e.id); toast.success('Submitted for approval'); }}>
                          Submit
                        </Button>
                      )}
                      {(e.status === 'draft' || e.status === 'rejected') && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-destructive"><Trash2 className="h-3 w-3" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete event?</AlertDialogTitle>
                              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => { deleteEvent(e.id); toast.success('Event deleted'); }}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Event' : 'New Event'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v as EventCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Time</Label><Input value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="09:00 AM" /></div>
              <div><Label>Venue *</Label><Input value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: parseInt(e.target.value) || 0 }))} /></div>
              <div><Label>Entry Fee (₹)</Label><Input type="number" value={form.entryFee} onChange={e => setForm(p => ({ ...p, entryFee: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Per-event Dashboard Dialog */}
      <Dialog open={dashOpen} onOpenChange={setDashOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dashEvent?.title} – Dashboard</DialogTitle></DialogHeader>
          {dashEvent && (
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="registrations">Registrations</TabsTrigger>
                <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
                <TabsTrigger value="logistics">Logistics</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-2 mt-3">
                <p className="text-sm"><strong>Date:</strong> {dashEvent.date} at {dashEvent.time}</p>
                <p className="text-sm"><strong>Venue:</strong> {dashEvent.venue}</p>
                <p className="text-sm"><strong>Status:</strong> <StatusBadge status={dashEvent.status} /></p>
                <p className="text-sm"><strong>Registrations:</strong> {dashEvent.registeredCount}/{dashEvent.capacity}</p>
              </TabsContent>
              <TabsContent value="registrations" className="mt-3">
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {eventRegs.map(r => (
                      <TableRow key={r.id}>
                        <TableCell>{r.studentName}</TableCell>
                        <TableCell className="text-xs">{r.studentEmail}</TableCell>
                        <TableCell><StatusBadge status={r.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {eventRegs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No registrations yet.</p>}
              </TabsContent>
              <TabsContent value="volunteers" className="mt-3">
                {eventVols.length === 0
                  ? <p className="text-sm text-muted-foreground text-center py-4">No volunteers assigned.</p>
                  : <div className="space-y-2">{eventVols.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">{a.vol?.name}</span>
                      <span className="text-xs text-muted-foreground">{a.role}</span>
                    </div>
                  ))}</div>
                }
              </TabsContent>
              <TabsContent value="logistics" className="mt-3">
                {eventLog ? (
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Venue:</strong> {eventLog.venue}</p>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${eventLog.checklist.length ? (eventLog.checklist.filter(c => c.done).length / eventLog.checklist.length) * 100 : 0}%` }}
                      />
                    </div>
                    {eventLog.checklist.map(c => (
                      <div key={c.id} className="flex items-center gap-2 text-sm">
                        <span className={c.done ? 'line-through text-muted-foreground' : ''}>{c.task}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-4">No logistics record.</p>}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
