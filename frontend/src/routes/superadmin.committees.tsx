import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFest } from "@/lib/fest-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, UserPlus, BarChart3, X } from "lucide-react";

export const Route = createFileRoute("/superadmin/committees")({ component: SuperadminCommittees });

function SuperadminCommittees() {
  const { committees, admins, events, volunteers, sponsors, createCommittee, deleteCommittee, assignAdminToCommittee, removeAdminFromCommittee } = useFest();
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);
  const [selectedComm, setSelectedComm] = useState<string | null>(null);
  const [assignAdmin, setAssignAdmin] = useState('');
  const [newComm, setNewComm] = useState({ name: '', description: '' });

  const handleCreate = () => {
    if (!newComm.name.trim()) { toast.error('Name required'); return; }
    createCommittee(newComm.name.trim(), newComm.description.trim());
    setNewComm({ name: '', description: '' });
    setCreateOpen(false);
    toast.success('Committee created');
  };

  const handleAssign = () => {
    if (!selectedComm || !assignAdmin) { toast.error('Select an admin'); return; }
    assignAdminToCommittee(assignAdmin, selectedComm);
    setAssignAdmin('');
    setAssignOpen(false);
    toast.success('Admin assigned');
  };

  const dashComm = committees.find(c => c.id === selectedComm);
  const dashAdmins = dashComm ? admins.filter(a => dashComm.adminIds.includes(a.id)) : [];
  const dashEvents = dashComm ? events.filter(e => e.committee === dashComm.name) : [];
  const dashVols = dashComm ? volunteers.filter(v => v.committee === dashComm?.name) : [];
  const dashSponsors = dashComm ? sponsors.filter(s => s.committee === dashComm?.name) : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Committees</h1>
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1" /> New Committee</Button>
      </div>

      <div className="space-y-4">
        {committees.map(c => {
          const cAdmins = admins.filter(a => c.adminIds.includes(a.id) && a.status === 'approved');
          const availableAdmins = admins.filter(a => a.status === 'approved' && !c.adminIds.includes(a.id));
          return (
            <Card key={c.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div><h3 className="font-semibold">{c.name}</h3><p className="text-sm text-muted-foreground">{c.description}</p></div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setSelectedComm(c.id); setDashOpen(true); }}><BarChart3 className="h-3 w-3 mr-1" /> Dashboard</Button>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedComm(c.id); setAssignOpen(true); }} disabled={availableAdmins.length === 0}><UserPlus className="h-3 w-3 mr-1" /> Assign Admin</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button size="sm" variant="outline" className="text-destructive"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete {c.name}?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteCommittee(c.id); toast.success('Committee deleted'); }}>Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cAdmins.map(a => (
                    <Badge key={a.id} variant="secondary" className="flex items-center gap-1">
                      {a.name}
                      <button onClick={() => { removeAdminFromCommittee(a.id, c.id); toast.success('Admin removed'); }} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                  {cAdmins.length === 0 && <span className="text-xs text-muted-foreground">No admins assigned</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent><DialogHeader><DialogTitle>New Committee</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={newComm.name} onChange={e => setNewComm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={newComm.description} onChange={e => setNewComm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent><DialogHeader><DialogTitle>Assign Admin</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={assignAdmin} onValueChange={setAssignAdmin}>
              <SelectTrigger><SelectValue placeholder="Select admin" /></SelectTrigger>
              <SelectContent>
                {admins.filter(a => a.status === 'approved' && selectedComm && !committees.find(c => c.id === selectedComm)?.adminIds.includes(a.id)).map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAssign}>Assign</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dashOpen} onOpenChange={setDashOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dashComm?.name} — Dashboard</DialogTitle></DialogHeader>
          {dashComm && (
            <Tabs defaultValue="overview">
              <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="events">Events</TabsTrigger><TabsTrigger value="team">Team</TabsTrigger></TabsList>
              <TabsContent value="overview" className="mt-3 space-y-2">
                <p className="text-sm text-muted-foreground">{dashComm.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[['Admins', dashAdmins.length], ['Events', dashEvents.length], ['Volunteers', dashVols.length], ['Sponsors', dashSponsors.length]].map(([l, v]) => (
                    <Card key={l as string}><CardContent className="p-3 text-center"><p className="text-lg font-bold">{v as number}</p><p className="text-xs text-muted-foreground">{l as string}</p></CardContent></Card>
                  ))}
                </div>
                <p className="text-sm"><strong>Sponsor Value:</strong> ₹{dashSponsors.reduce((a, s) => a + s.dealAmount, 0).toLocaleString()}</p>
              </TabsContent>
              <TabsContent value="events" className="mt-3">
                <div className="space-y-2">{dashEvents.map(e => (
                  <div key={e.id} className="flex items-center justify-between p-2 bg-muted/50 rounded"><span className="text-sm font-medium">{e.title}</span><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{e.registeredCount} reg</span><StatusBadge status={e.status} /></div></div>
                ))}</div>
              </TabsContent>
              <TabsContent value="team" className="mt-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Admins</h4>
                  {dashAdmins.map(a => <div key={a.id} className="flex items-center justify-between p-2 bg-muted/50 rounded"><span className="text-sm">{a.name}</span><span className="text-xs text-muted-foreground">{a.email}</span></div>)}
                  <h4 className="text-sm font-medium mt-3">Volunteers ({dashVols.length})</h4>
                  {dashVols.map(v => <div key={v.id} className="text-sm p-2 bg-muted/50 rounded">{v.name}</div>)}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
