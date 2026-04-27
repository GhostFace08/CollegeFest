import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useFest } from "@/lib/fest-context";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, UserPlus, Phone, Mail } from "lucide-react";
import { VOLUNTEER_ROLES } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/volunteers")({ component: AdminVolunteers });

function AdminVolunteers() {
  const { volunteers, assignments, events, addVolunteer, assignVolunteer, toggleVolunteerAttendance, refreshVolunteers } = useFest();
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedVol, setSelectedVol] = useState<string | null>(null);
  const [newVol, setNewVol] = useState({ name: '', email: '', phone: '' });
  const [assignForm, setAssignForm] = useState({ eventId: '', role: '' });

  // BUG 2 FIX: Fetch volunteers on mount if not already loaded
  useEffect(() => { refreshVolunteers(); }, []);

  // BUG 2 FIX: volunteers API already scopes to this admin's committee via auth.
  // Do NOT filter by committee name — backend returns the right set.
  const myVols = volunteers;

  // Events scoped to this admin (already filtered by /events/admin/mine)
  const myEvents = events.filter(e => e.status === 'approved');

  const handleAdd = () => {
    if (!newVol.name || !newVol.email) { toast.error('Name and email required'); return; }
    addVolunteer({ ...newVol, committee: user?.committees?.[0]?._id || user?.committee || '' });
    setNewVol({ name: '', email: '', phone: '' });
    setAddOpen(false);
    toast.success('Volunteer added');
  };

  const handleAssign = () => {
    if (!selectedVol || !assignForm.eventId || !assignForm.role) { toast.error('Select event and role'); return; }
    assignVolunteer(selectedVol, assignForm.eventId, assignForm.role);
    setAssignForm({ eventId: '', role: '' });
    setAssignOpen(false);
    toast.success('Volunteer assigned');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Volunteers</h1>
          <p className="text-sm text-muted-foreground">{user?.committee}</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Volunteer</Button>
      </div>

      {myVols.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No volunteers yet. Add your first volunteer!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myVols.map(vol => {
            const volAssignments = assignments.filter(a => a.volunteerId === vol.id);
            return (
              <Card key={vol.id} className="border-border/60">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{vol.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{vol.email}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{vol.phone}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedVol(vol.id); setAssignOpen(true); }}>
                      <UserPlus className="h-3 w-3 mr-1" /> Assign
                    </Button>
                  </div>
                  {volAssignments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Assignments</p>
                      {volAssignments.map(a => {
                        const evt = events.find(e => e.id === a.eventId);
                        return (
                          <div key={a.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{evt?.title || 'Unknown'}</span>
                              <Badge variant="outline" className="text-xs">{a.role}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{a.attended ? 'Attended' : 'Not attended'}</span>
                              <Switch
                                checked={a.attended}
                                onCheckedChange={() => { toggleVolunteerAttendance(a.id); toast.success('Attendance updated'); }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Volunteer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={newVol.name} onChange={e => setNewVol(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Email *</Label><Input value={newVol.email} onChange={e => setNewVol(p => ({ ...p, email: e.target.value }))} /></div>
            <div><Label>Phone</Label><Input value={newVol.phone} onChange={e => setNewVol(p => ({ ...p, phone: e.target.value }))} /></div>
            <Button onClick={handleAdd}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign to Event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Event *</Label>
              <Select value={assignForm.eventId} onValueChange={v => setAssignForm(p => ({ ...p, eventId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger>
                <SelectContent>{myEvents.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role *</Label>
              <Select value={assignForm.role} onValueChange={v => setAssignForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>{VOLUNTEER_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssign}>Assign</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
