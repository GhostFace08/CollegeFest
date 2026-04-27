import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useFest } from "@/lib/fest-context";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, X, Save } from "lucide-react";

export const Route = createFileRoute("/admin/logistics")({
  validateSearch: (search: Record<string, unknown>) => ({ event: (search.event as string) || '' }),
  component: AdminLogistics,
});

function AdminLogistics() {
  const { event: preselected } = Route.useSearch();
  const {
    events, logistics,
    createLogistics, updateLogisticsField, toggleLogisticsItem, addLogisticsItem, removeLogisticsItem,
    refreshLogistics,
  } = useFest();
  const { user } = useAuth();

  // BUG 2 FIX: Refresh logistics on mount
  useEffect(() => { refreshLogistics(); }, []);

  // BUG 2 FIX: events already scoped to this admin — no committee filter needed
  const myEvents = events.filter(e => e.status === 'approved');
  const [selected, setSelected] = useState(preselected || (myEvents[0]?.id || ''));
  const [newItem, setNewItem] = useState('');
  const [newVenue, setNewVenue] = useState('');

  // Update selection if myEvents loads after mount
  useEffect(() => {
    if (!selected && myEvents.length > 0) setSelected(myEvents[0].id);
  }, [myEvents.length]);

  const record = logistics.find(l => l.eventId === selected);
  const event = events.find(e => e.id === selected);
  const progress = record?.checklist.length
    ? (record.checklist.filter(c => c.done).length / record.checklist.length) * 100
    : 0;

  const handleCreate = () => {
    if (!newVenue.trim()) { toast.error('Enter venue'); return; }
    createLogistics(selected, newVenue.trim());
    setNewVenue('');
    toast.success('Logistics created');
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    addLogisticsItem(selected, newItem.trim());
    setNewItem('');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logistics</h1>
        <p className="text-sm text-muted-foreground">{user?.committee}</p>
      </div>

      {myEvents.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No approved events yet. Events must be approved before managing logistics.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {myEvents.map(e => (
              <Button key={e.id} size="sm" variant={selected === e.id ? 'default' : 'outline'} onClick={() => setSelected(e.id)}>
                {e.title}
              </Button>
            ))}
          </div>

          {!selected || !event ? (
            <p className="text-muted-foreground text-center py-8">Select an event to manage logistics.</p>
          ) : !record ? (
            <Card>
              <CardContent className="p-6 space-y-3">
                <p className="text-muted-foreground">No logistics record for <strong>{event.title}</strong>.</p>
                <div>
                  <Label>Venue</Label>
                  <Input value={newVenue} onChange={e => setNewVenue(e.target.value)} placeholder="Enter venue" />
                </div>
                <Button onClick={handleCreate}>Create Logistics</Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader><CardTitle>{event.title} – Logistics</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Venue</Label>
                    <Input value={record.venue} onChange={e => updateLogisticsField(selected, 'venue', e.target.value)} />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea value={record.notes} onChange={e => updateLogisticsField(selected, 'notes', e.target.value)} rows={1} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Checklist ({record.checklist.filter(c => c.done).length}/{record.checklist.length})</Label>
                  </div>
                  <Progress value={progress} className="h-2 mb-3" />
                  <div className="space-y-2">
                    {record.checklist.map(item => (
                      <div key={item.id} className="flex items-center justify-between group p-2 rounded hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={item.done} onCheckedChange={() => toggleLogisticsItem(selected, item.id)} />
                          <span className={`text-sm ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.task}</span>
                        </div>
                        <Button
                          size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => removeLogisticsItem(selected, item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Add item..."
                      value={newItem}
                      onChange={e => setNewItem(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddItem(); }}
                    />
                    <Button size="sm" onClick={handleAddItem}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>

                <Button size="sm" onClick={() => toast.success('Logistics saved')}>
                  <Save className="h-3.5 w-3.5 mr-1" /> Save
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
