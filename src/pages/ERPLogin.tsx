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
import { erpSignIn, getERPUser } from '@/lib/erpData';

const ERPLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getERPUser();
    if (user) navigate('/erp');
  }, [navigate]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast({ title: 'Enter email and password', variant: 'destructive' }); return; }
    setIsSubmitting(true);
    
    const result = erpSignIn(email, password);
    setIsSubmitting(false);
    
    if (result.success) {
      toast({ title: 'Welcome back!', description: `Signed in as ${result.user!.role}` });
      navigate('/erp');
    } else {
      toast({ title: 'Login failed', description: result.error, variant: 'destructive' });
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
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@hotel.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : 'Sign In'}
              </Button>
            </form>
            <div className="bg-accent/30 rounded-lg p-3 space-y-1 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground text-sm mb-1">Demo Credentials:</p>
              <p><span className="font-medium">Admin:</span> admin@hotel.com / admin123</p>
              <p><span className="font-medium">Employee:</span> employee@hotel.com / employee123</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ERPLogin;
