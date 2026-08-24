import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowRight, LockKeyhole, Loader2, ShieldCheck } from "lucide-react";

const AdminAppLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/admin-app");
    }
  }, [user, isLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/admin-app");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#102a43] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden bg-[#102a43] p-12 lg:flex lg:flex-col lg:justify-between xl:p-20">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-[#e4b35c]/20" />
          <div className="absolute bottom-20 right-20 h-56 w-56 rounded-full border border-[#e4b35c]/10" />
          <div className="relative flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e4b35c] text-[#102a43]"><ShieldCheck className="h-6 w-6" /></div><div><p className="text-sm font-semibold tracking-[0.2em] text-[#e4b35c]">ROOMBOOKER</p><p className="text-xs text-white/45">Operations console</p></div></div>
          <div className="relative max-w-lg"><p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#e4b35c]">Private workspace</p><h1 className="text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">Run the stay<br /><span className="text-white/45">behind the stay.</span></h1><p className="mt-7 max-w-md text-base leading-7 text-white/60">One calm place for reservations, rooms, payments, and the people who make every guest feel looked after.</p></div>
          <p className="relative text-xs text-white/35">Authorized personnel only · Secure hotel operations</p>
        </section>
        <main className="flex items-center justify-center bg-[#f7f8fa] px-5 py-12 text-slate-900 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102a43] text-[#e4b35c]"><ShieldCheck className="h-5 w-5" /></div><p className="text-sm font-semibold tracking-[0.18em] text-[#102a43]">ROOMBOOKER</p></div>
            <div className="mb-8"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#b77b1f]">Welcome back</p><h2 className="text-3xl font-semibold tracking-tight">Sign in to your console</h2><p className="mt-2 text-sm text-slate-500">Manage the property with clarity and confidence.</p></div>
            <Card className="border-slate-200 bg-white shadow-xl shadow-slate-200/50"><CardHeader className="border-b border-slate-100 pb-5"><CardTitle className="flex items-center gap-2 text-base"><LockKeyhole className="h-4 w-4 text-[#b77b1f]" /> Administrator access</CardTitle><CardDescription>Use the credentials created for your hotel.</CardDescription></CardHeader><CardContent className="pt-6"><form onSubmit={handleSignIn} className="space-y-5"><div className="space-y-2"><Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email address</Label><Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 bg-slate-50" /></div><div className="space-y-2"><Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</Label><Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 bg-slate-50" /></div><Button type="submit" className="h-12 w-full bg-[#102a43] text-white hover:bg-[#193b5a]" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : <>Enter workspace <ArrowRight className="ml-2 h-4 w-4" /></>}</Button></form></CardContent></Card>
            <p className="mt-6 text-center text-xs text-slate-400">Your session is protected with secure authentication.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAppLogin;
