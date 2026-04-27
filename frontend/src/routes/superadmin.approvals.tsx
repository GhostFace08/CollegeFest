import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFest } from "@/lib/fest-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategoryBadge, StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { CheckCircle, XCircle, MapPin, Clock, Users, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/superadmin/approvals")({ component: SuperadminApprovals });

function SuperadminApprovals() {
  const { events, admins, approveEvent, rejectEvent } = useFest();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState('');
  const [rejectNote, setRejectNote] = useState('');

  const pending = events.filter(e => e.status === 'pending');

  const handleReject = () => {
    if (!rejectNote.trim()) { toast.error('Please provide a reason'); return; }
    rejectEvent(rejectId, rejectNote.trim());
    setRejectOpen(false);
    setRejectNote('');
    toast.success('Event rejected');
  };

  const getAdminName = (id: string) => admins.find(a => a.id === id)?.name || 'Unknown';

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Event Approvals</h1>
      <Tabs defaultValue="pending">
        <TabsList><TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger><TabsTrigger value="all">All Events</TabsTrigger></TabsList>

        <TabsContent value="pending" className="mt-4 space-y-4">
          {pending.length === 0 ? <p className="text-muted-foreground text-center py-8">No events pending approval.</p> : (
            pending.map(e => (
              <Card key={e.id} className="border-border/60">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-lg">{e.title}</h3>
                      <div className="flex items-center gap-2 mt-1"><CategoryBadge category={e.category} /><span className="text-xs text-muted-foreground">by {getAdminName(e.createdBy)}</span></div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { approveEvent(e.id); toast.success('Event approved'); }}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => { setRejectId(e.id); setRejectOpen(true); }}>
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{e.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{e.date} {e.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.venue}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />Capacity: {e.capacity}</span>
                    <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{e.entryFee === 0 ? 'Free' : `₹${e.entryFee}`}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Created By</TableHead></TableRow></TableHeader>
              <TableBody>
                {events.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell><CategoryBadge category={e.category} /></TableCell>
                    <TableCell><StatusBadge status={e.status} /></TableCell>
                    <TableCell className="text-sm">{e.date}</TableCell>
                    <TableCell className="text-sm">{getAdminName(e.createdBy)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent><DialogHeader><DialogTitle>Reject Event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Reason *</Label><Input value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Why is this event being rejected?" /></div>
            <div className="flex gap-2"><Button variant="destructive" onClick={handleReject}>Reject</Button><Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
