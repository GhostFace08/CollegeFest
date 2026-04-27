import { createFileRoute } from "@tanstack/react-router";
import { useFest } from "@/lib/fest-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle, UserX, Clock, Mail } from "lucide-react";

export const Route = createFileRoute("/superadmin/admins")({ component: SuperadminAdmins });

function SuperadminAdmins() {
  const { admins, committees, approveAdmin, rejectAdmin, deactivateAdmin } = useFest();
  const pending = admins.filter(a => a.status === 'pending');
  const approved = admins.filter(a => a.status === 'approved');

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Management</h1>

      <div>
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><Clock className="h-5 w-5 text-yellow-600" /> Pending Approvals ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pending admin requests.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pending.map(a => (
              <Card key={a.id} className="border-yellow-200">
                <CardContent className="p-4 space-y-3">
                  <div><h3 className="font-semibold">{a.name}</h3><p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{a.email}</p>
                    {a.college && <p className="text-xs text-muted-foreground">{a.college}</p>}
                    <p className="text-xs text-muted-foreground">Applied: {a.joinedAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { approveAdmin(a.id); toast.success(`${a.name} approved. Go to Committees to assign a committee.`); }}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button size="sm" variant="outline" className="text-destructive"><XCircle className="h-3.5 w-3.5 mr-1" /> Reject</Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Reject {a.name}?</AlertDialogTitle><AlertDialogDescription>This admin will be rejected.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { rejectAdmin(a.id); toast.success('Admin rejected'); }}>Reject</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3">All Approved Admins ({approved.length})</h2>
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Committees</TableHead><TableHead>Joined</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {approved.map(a => {
                const comms = committees.filter(c => c.adminIds.includes(a.id));
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-sm">{a.email}</TableCell>
                    <TableCell>{comms.length > 0 ? comms.map(c => <Badge key={c.id} variant="secondary" className="mr-1 text-xs">{c.name}</Badge>) : <span className="text-xs text-muted-foreground">None</span>}</TableCell>
                    <TableCell className="text-sm">{a.joinedAt}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button size="sm" variant="ghost" className="text-destructive"><UserX className="h-3.5 w-3.5 mr-1" /> Deactivate</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Deactivate {a.name}?</AlertDialogTitle><AlertDialogDescription>This admin will lose access.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deactivateAdmin(a.id); toast.success('Admin deactivated'); }}>Deactivate</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
