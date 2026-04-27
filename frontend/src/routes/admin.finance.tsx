import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useFest } from "@/lib/fest-context";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { Plus, Trash2, DollarSign, TrendingUp, Wallet } from "lucide-react";
import type { SponsorStatus, ChecklistItem } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/finance")({ component: AdminFinance });

const pipelineStages: SponsorStatus[] = ['contacted', 'negotiating', 'confirmed', 'received'];

function AdminFinance() {
  const { events, sponsors, finances, addSponsor, updateSponsorStatus, toggleSponsorChecklist, addSponsorChecklistItem, deleteSponsor, refreshSponsors } = useFest();
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', dealAmount: 0, dealType: 'cash' as 'cash' | 'in-kind',
    status: 'contacted' as SponsorStatus, notes: '', checklistItems: [''],
  });

  // Inline "add task" input state per sponsor — keyed by sponsor id
  const [newTaskInput, setNewTaskInput] = useState<Record<string, string>>({});

  useEffect(() => { refreshSponsors(); }, []);

  const mySponsors = sponsors;
  const myEvents = events.filter(e => e.status === 'approved');
  const [finEvent, setFinEvent] = useState(myEvents[0]?.id || '');

  useEffect(() => {
    if (!finEvent && myEvents.length > 0) setFinEvent(myEvents[0].id);
  }, [myEvents.length]);

  const finRecord = finances.find(f => f.eventId === finEvent);

  const confirmed = mySponsors
    .filter(s => s.status === 'confirmed' || s.status === 'received')
    .reduce((a, s) => a + s.dealAmount, 0);
  const pipeline = mySponsors.reduce((a, s) => a + s.dealAmount, 0);

  const handleAdd = () => {
    if (!form.name) { toast.error('Name required'); return; }
    const checklist: ChecklistItem[] = form.checklistItems
      .filter(i => i.trim())
      .map((task, i) => ({ id: `new-${Date.now()}-${i}`, task, done: false }));
    addSponsor({
      name: form.name,
      dealAmount: form.dealAmount,
      dealType: form.dealType,
      status: form.status,
      committee: user?.committees?.[0]?._id || user?.committee || '',
      notes: form.notes,
      checklist,
    });
    setForm({ name: '', dealAmount: 0, dealType: 'cash', status: 'contacted', notes: '', checklistItems: [''] });
    setAddOpen(false);
    toast.success('Sponsor added');
  };

  const handleAddTask = async (sid: string) => {
    const task = newTaskInput[sid]?.trim();
    if (!task) return;
    await addSponsorChecklistItem(sid, task);
    setNewTaskInput(p => ({ ...p, [sid]: '' }));
    toast.success('Task added');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finance & Sponsors</h1>
        <p className="text-sm text-muted-foreground">{user?.committee}</p>
      </div>

      <Tabs defaultValue="sponsors">
        <TabsList>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        <TabsContent value="sponsors" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><CardContent className="p-4 flex items-center gap-3"><Wallet className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{mySponsors.length}</p><p className="text-xs text-muted-foreground">Total Sponsors</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><DollarSign className="h-8 w-8 text-green-600" /><div><p className="text-2xl font-bold">₹{confirmed.toLocaleString()}</p><p className="text-xs text-muted-foreground">Confirmed</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="h-8 w-8 text-yellow-600" /><div><p className="text-2xl font-bold">₹{pipeline.toLocaleString()}</p><p className="text-xs text-muted-foreground">Pipeline</p></div></CardContent></Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add Sponsor</Button>
          </div>

          {mySponsors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No sponsors yet. Add your first sponsor!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mySponsors.map(s => (
                <Card key={s.id} className="border-border/60">
                  <CardContent className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{s.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{s.dealAmount.toLocaleString()} • {s.dealType}</p>
                        {s.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{s.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={s.status} />
                        <Button
                          size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                          onClick={() => { deleteSponsor(s.id); toast.success('Sponsor removed'); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Pipeline stages */}
                    <div className="flex gap-1">
                      {pipelineStages.map(stage => (
                        <button
                          key={stage}
                          onClick={() => { updateSponsorStatus(s.id, stage); toast.success(`Status: ${stage}`); }}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            s.status === stage
                              ? 'bg-primary text-primary-foreground'
                              : pipelineStages.indexOf(stage) <= pipelineStages.indexOf(s.status)
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {stage}
                        </button>
                      ))}
                    </div>

                    {/* Checklist */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Deliverables / Tasks ({s.checklist.filter(c => c.done).length}/{s.checklist.length} done)
                      </p>
                      {s.checklist.map(c => (
                        <div key={c.id} className="flex items-center gap-2">
                          <Checkbox checked={c.done} onCheckedChange={() => toggleSponsorChecklist(s.id, c.id)} />
                          <span className={`text-sm ${c.done ? 'line-through text-muted-foreground' : ''}`}>{c.task}</span>
                        </div>
                      ))}

                      {/* FIX: Inline add-task input for existing sponsors */}
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Add task..."
                          value={newTaskInput[s.id] || ''}
                          onChange={e => setNewTaskInput(p => ({ ...p, [s.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddTask(s.id); }}
                          className="h-8 text-sm"
                        />
                        <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => handleAddTask(s.id)}>
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="finance" className="space-y-4 mt-4">
          <Select value={finEvent} onValueChange={setFinEvent}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select event" /></SelectTrigger>
            <SelectContent>{myEvents.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}</SelectContent>
          </Select>

          {finRecord ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {([
                  ['Budget', finRecord.budget],
                  ['Revenue', finRecord.revenue],
                  ['Expenses', finRecord.expenses.reduce((a, e) => a + e.amount, 0)],
                  ['Net', finRecord.budget - finRecord.expenses.reduce((a, e) => a + e.amount, 0) + finRecord.revenue],
                ] as [string, number][]).map(([l, v]) => (
                  <Card key={l}>
                    <CardContent className="p-4 text-center">
                      <p className="text-xl font-bold">₹{v.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{l}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader><CardTitle className="text-base">Expenses</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {finRecord.expenses.map(e => (
                        <TableRow key={e.id}><TableCell>{e.item}</TableCell><TableCell className="text-right">₹{e.amount.toLocaleString()}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <div>
                <p className="text-sm font-medium mb-1">Budget Utilization</p>
                <Progress value={(finRecord.expenses.reduce((a, e) => a + e.amount, 0) / finRecord.budget) * 100} className="h-3" />
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No finance record for this event.</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Sponsor Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Sponsor</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount (₹)</Label><Input type="number" value={form.dealAmount} onChange={e => setForm(p => ({ ...p, dealAmount: parseInt(e.target.value) || 0 }))} /></div>
              <div>
                <Label>Type</Label>
                <Select value={form.dealType} onValueChange={v => setForm(p => ({ ...p, dealType: v as 'cash' | 'in-kind' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="in-kind">In-Kind</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
            <div>
              <Label>Initial Checklist Items</Label>
              {form.checklistItems.map((item, i) => (
                <div key={i} className="flex gap-2 mt-1">
                  <Input
                    value={item}
                    onChange={e => { const c = [...form.checklistItems]; c[i] = e.target.value; setForm(p => ({ ...p, checklistItems: c })); }}
                    placeholder={`Task ${i + 1}`}
                  />
                  {i === form.checklistItems.length - 1 && (
                    <Button size="sm" variant="outline" onClick={() => setForm(p => ({ ...p, checklistItems: [...p.checklistItems, ''] }))}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button onClick={handleAdd}>Add Sponsor</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}