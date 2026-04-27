import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GraduationCap, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/")({ component: LoginPage });

type Mode = "login" | "register-student" | "register-admin";

function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register form
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    phone: "", college: "SPIT Mumbai", year: "First Year",
  });

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "superadmin") navigate({ to: "/superadmin/dashboard" as never });
      else if (user.role === "admin") navigate({ to: "/admin/dashboard" as never });
      else navigate({ to: "/student/events" as never });
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please enter both email and password"); return; }
    setSubmitting(true);
    const result = await login(email.trim(), password);
    setSubmitting(false);
    if (!result.success) { setError(result.error || "Invalid credentials"); return; }
    toast.success("Welcome back!");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Please fill in all required fields"); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match"); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters"); return;
    }
    setSubmitting(true);
    try {
      if (mode === "register-student") {
        const data = await api.post("/auth/register", {
          name: form.name, email: form.email, password: form.password,
          phone: form.phone, college: form.college, year: form.year,
        });
        // Auto login after student register
        const result = await login(form.email, form.password);
        if (result.success) toast.success("Account created! Welcome to CollegeFest.");
        else toast.success("Account created! Please sign in.");
      } else {
        await api.post("/auth/register-admin", {
          name: form.name, email: form.email, password: form.password, phone: form.phone,
        });
        toast.success("Admin request submitted! Awaiting superadmin approval.");
        setMode("login");
        setEmail(form.email);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || user) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">CollegeFest</CardTitle>
          <CardDescription>
            {mode === "login" && "Sign in to manage your college fest"}
            {mode === "register-student" && "Create your student account"}
            {mode === "register-admin" && "Request admin access"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Tab switcher */}
          <div className="flex rounded-lg border border-border overflow-hidden mb-6">
            {[
              { key: "login", label: "Sign In" },
              { key: "register-student", label: "Student" },
              { key: "register-admin", label: "Admin" },
            ].map(tab => (
              <button key={tab.key} onClick={() => { setMode(tab.key as Mode); setError(""); }}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  mode === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"}
                    placeholder="Enter your password" value={password}
                    onChange={e => setPassword(e.target.value)} className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          )}

          {/* STUDENT REGISTER FORM */}
          {mode === "register-student" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label>Full Name *</Label>
                  <Input placeholder="e.g. Rahul Sharma" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" placeholder="your@email.com" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input type="password" placeholder="Min. 6 characters" value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password *</Label>
                  <Input type="password" placeholder="Repeat password" value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="10-digit number" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <select value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {["First Year", "Second Year", "Third Year", "Fourth Year"].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>College</Label>
                  <Input placeholder="College name" value={form.college}
                    onChange={e => setForm(f => ({ ...f, college: e.target.value }))} />
                </div>
              </div>
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating account..." : "Create Student Account"}
              </Button>
            </form>
          )}

          {/* ADMIN REGISTER FORM */}
          {mode === "register-admin" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                ⚠️ Admin accounts require superadmin approval before you can log in.
              </div>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="e.g. Aryan Mehta" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="your@email.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="10-digit number" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input type="password" placeholder="Min. 6 characters" value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Confirm *</Label>
                  <Input type="password" placeholder="Repeat" value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                </div>
              </div>
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Request Admin Access"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
