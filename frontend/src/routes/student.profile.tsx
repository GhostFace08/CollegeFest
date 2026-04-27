import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Pencil } from "lucide-react";

export const Route = createFileRoute("/student/profile")({ component: StudentProfile });

function StudentProfile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', college: user?.college || '', year: user?.year || '' });

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
    toast.success('Profile updated');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle>
          {!editing && <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>}
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              {[['Name', 'name'], ['Phone', 'phone'], ['College', 'college'], ['Year', 'year']].map(([label, key]) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="space-y-1.5"><Label>Email</Label><Input value={user?.email || ''} disabled /></div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {[['Name', user?.name], ['Email', user?.email], ['Phone', user?.phone || 'Not set'], ['College', user?.college || 'Not set'], ['Year', user?.year || 'Not set']].map(([label, val]) => (
                <div key={label as string}><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{val}</p></div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
