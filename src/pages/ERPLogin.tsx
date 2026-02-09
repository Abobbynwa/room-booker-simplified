import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { erpLogin, erpStaffLogin } from '@/lib/erp-api';
import { getERPUser, setERPAuth } from '@/lib/erp-auth';

const ERPLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('receptionist');
  const [staffCode, setStaffCode] = useState('');
  const [mode, setMode] = useState<'staff' | 'admin'>('staff');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getERPUser();
    if (user) navigate('/erp');
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'admin') {
      if (!email || !password) { toast({ title: 'Enter email and password', variant: 'destructive' }); return; }
    } else {
      if (!role || !staffCode) { toast({ title: 'Select role and enter staff ID', variant: 'destructive' }); return; }
    }
    setIsSubmitting(true);
    
    try {
      const result = mode === 'admin'
        ? await erpLogin(email, password)
        : await erpStaffLogin(role, staffCode);
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
      <Header />
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
                    <Input id="role" placeholder="receptionist / bar / housekeeping" value={role} onChange={e => setRole(e.target.value.toLowerCase())} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staff_code">Staff ID</Label>
                    <Input id="staff_code" placeholder="STAFF ID" value={staffCode} onChange={e => setStaffCode(e.target.value)} />
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
      <Footer />
    </div>
  );
};

export default ERPLogin;
