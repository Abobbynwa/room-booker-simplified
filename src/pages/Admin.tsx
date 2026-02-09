import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { changeAdminPassword, fetchAdminBookings, fetchAdminMessages } from '@/lib/backend-api';
import { Loader2, LogOut, RefreshCcw, ShieldCheck, Mail, ClipboardList } from 'lucide-react';

type AdminBooking = {
  id: number;
  name: string;
  email: string;
  room_type: string;
  check_in: string;
  check_out: string;
  created_at: string;
};

type AdminMessage = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

const Admin = () => {
  const { toast } = useToast();
  const { token, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({ title: 'Signed out successfully' });
  };

  const loadBookings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchAdminBookings(token);
      setBookings(data as AdminBooking[]);
    } catch (error) {
      toast({
        title: 'Failed to load bookings',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!token) return;
    setLoadingMessages(true);
    try {
      const data = await fetchAdminMessages(token);
      setMessages(data as AdminMessage[]);
    } catch (error) {
      toast({
        title: 'Failed to load messages',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!currentPassword || !newPassword) {
      toast({ title: 'Missing fields', description: 'Enter your current and new password.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please confirm your new password.' });
      return;
    }

    setSavingPassword(true);
    try {
      const result = await changeAdminPassword(token, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast({ title: 'Password updated', description: result.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Password update failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }
    loadBookings();
    loadMessages();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">Admin Panel</h1>
              <p className="text-muted-foreground mt-1">
                Signed in as {user?.email || 'admin'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { loadBookings(); loadMessages(); }}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Total Bookings</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="text-3xl font-semibold">
                {bookings.length}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Contact Messages</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="text-3xl font-semibold">
                {messages.length}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Admin Status</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Signed in and connected to live backend.
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">ERP Access</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div>Admin can access the full ERP interface using the same admin credentials.</div>
                <Button className="w-fit" onClick={() => window.open('/#/erp/login', '_blank')}>
                  Open ERP
                </Button>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="bookings">
            <TabsList>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading bookings...
                    </div>
                  ) : bookings.length === 0 ? (
                    <p className="text-muted-foreground">No bookings yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Room Type</TableHead>
                          <TableHead>Check In</TableHead>
                          <TableHead>Check Out</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>{booking.id}</TableCell>
                            <TableCell>{booking.name}</TableCell>
                            <TableCell>{booking.email}</TableCell>
                            <TableCell>{booking.room_type}</TableCell>
                            <TableCell>{booking.check_in}</TableCell>
                            <TableCell>{booking.check_out}</TableCell>
                            <TableCell>{booking.created_at}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingMessages ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-muted-foreground">No messages yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messages.map((message) => (
                          <TableRow key={message.id}>
                            <TableCell>{message.id}</TableCell>
                            <TableCell>{message.name}</TableCell>
                            <TableCell>{message.email}</TableCell>
                            <TableCell className="max-w-md whitespace-pre-wrap">{message.message}</TableCell>
                            <TableCell>{message.created_at}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4 max-w-md" onSubmit={handleChangePassword}>
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" disabled={savingPassword}>
                      {savingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
