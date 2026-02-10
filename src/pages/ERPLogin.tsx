import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { erpLogin, erpStaffLogin } from '@/lib/erp-api';
import { getERPUser, setERPAuth } from '@/lib/erp-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLE_OPTIONS } from '@/lib/erp-constants';

const ERPLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('receptionist');
  const [staffPassword, setStaffPassword] = useState('');
  const [mode, setMode] = useState<'staff' | 'admin'>('staff');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('access') !== 'erp') {
      navigate('/');
      return;
    }
    const user = getERPUser();
    if (user) navigate('/erp');
  }, [navigate, location.search]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'admin') {
      if (!email || !password) { toast({ title: 'Enter email and password', variant: 'destructive' }); return; }
    } else {
      if (!role || !staffPassword) { toast({ title: 'Select role and enter password', variant: 'destructive' }); return; }
    }
    setIsSubmitting(true);
    
    try {
      const result = mode === 'admin'
        ? await erpLogin(email, password)
        : await erpStaffLogin(role, staffPassword);
      setERPAuth(result.access_token, result.user);
      toast({ title: 'Welcome back!', description: `Signed in as ${result.user.role}` });
      navigate('/erp');
    } catch (error) {
      toast({ title: 'Login failed', description: error instanceof Error ? error.message : 'Invalid credentials', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-serif font-bold text-gold text-xl">Abobby Nwa Suite</div>
          <div className="text-xs text-muted-foreground">ERP Portal</div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-serif">Hotel ERP Login</CardTitle>
            <CardDescription>Sign in as Admin or Employee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 text-sm">
              <Button variant={mode === 'staff' ? 'default' : 'outline'} onClick={() => setMode('staff')}>Staff</Button>
              <Button variant={mode === 'admin' ? 'default' : 'outline'} onClick={() => setMode('admin')}>Admin</Button>
            </div>
            <form onSubmit={handleSignIn} className="space-y-4">
              {mode === 'admin' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="admin@hotel.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger id="role"><SelectValue placeholder="Select role" /></SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map(r => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff_password">Password</Label>
                    <Input id="staff_password" type="password" placeholder="Password from admin" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} />
                  </div>
                </>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Abobby Nwa Suite. Staff access only.
        </div>
      </footer>
    </div>
  );
};

export default ERPLogin;
