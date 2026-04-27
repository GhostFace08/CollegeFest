import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  open: boolean; onOpenChange: (o: boolean) => void;
  data: { id: string; eventTitle: string; studentName: string; eventDate: string } | null;
}

export function QRModal({ open, onOpenChange, data }: Props) {
  if (!data) return null;
  const qrValue = JSON.stringify({ registrationId: data.id, event: data.eventTitle, student: data.studentName });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Registration QR Code</DialogTitle></DialogHeader>
        <div className="flex flex-col items-center py-4">
          <div className="p-4 bg-card rounded-xl border border-border">
            <QRCodeSVG value={qrValue} size={180} />
          </div>
          <div className="mt-4 text-center space-y-1">
            <p className="text-sm font-semibold">{data.eventTitle}</p>
            <p className="text-xs text-muted-foreground">ID: {data.id}</p>
            <p className="text-xs text-muted-foreground">{data.eventDate}</p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground italic">Show at entrance for check-in</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
