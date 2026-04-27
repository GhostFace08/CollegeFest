import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFest } from "@/lib/fest-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { QrCode, Search, UserCheck, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/admin/scanner")({ component: QRScanner });

function QRScanner() {
  const { registrations, events, markRegistrationAttended } = useFest();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ reg: typeof registrations[0]; event: typeof events[0] } | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleLookup = () => {
    const reg = registrations.find(r => r.id === input.trim());
    if (!reg) { setNotFound(true); setResult(null); return; }
    const event = events.find(e => e.id === reg.eventId);
    if (!event) { setNotFound(true); setResult(null); return; }
    setResult({ reg, event });
    setNotFound(false);
  };

  const handleAttend = () => {
    if (!result) return;
    markRegistrationAttended(result.reg.id);
    setResult({ ...result, reg: { ...result.reg, status: 'attended' } });
    toast.success(`${result.reg.studentName} marked as attended`);
  };

  const handleClear = () => { setInput(''); setResult(null); setNotFound(false); };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">QR Scanner</h1>

      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-8 flex flex-col items-center gap-3">
          <QrCode className="h-16 w-16 text-primary/40" />
          <p className="text-sm text-muted-foreground">Camera view placeholder</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Manual Lookup</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Enter Registration ID (e.g. reg-1)" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleLookup(); }} />
            <Button onClick={handleLookup}><Search className="h-4 w-4" /></Button>
          </div>

          {notFound && <p className="text-sm text-destructive">Registration not found.</p>}

          {result && (
            <Card className="border-border/60">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between"><h3 className="font-semibold">{result.reg.studentName}</h3><StatusBadge status={result.reg.status} /></div>
                <p className="text-sm text-muted-foreground">{result.reg.studentEmail}</p>
                <p className="text-sm"><strong>Event:</strong> {result.event.title}</p>
                <p className="text-sm"><strong>Date:</strong> {result.event.date}</p>
                <div className="flex gap-2 pt-2">
                  {result.reg.status !== 'attended' && <Button size="sm" onClick={handleAttend}><UserCheck className="h-3.5 w-3.5 mr-1" /> Mark Attended</Button>}
                  <Button size="sm" variant="outline" onClick={handleClear}><RotateCcw className="h-3.5 w-3.5 mr-1" /> Clear</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
