import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { fetchAdminBookings, fetchAdminMessages } from '@/lib/backend-api';
import { Loader2, LogOut, RefreshCcw } from 'lucide-react';

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

          <Tabs defaultValue="bookings">
            <TabsList>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
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
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
