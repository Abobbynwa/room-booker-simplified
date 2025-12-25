import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { fetchAllBookings, fetchRooms, updateBookingStatus, deleteBooking, updateRoomAvailability } from '@/lib/api';
import { Booking, BookingStatus, Room } from '@/types/hotel';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Search, Hotel, CalendarCheck, Users, DollarSign, Trash2, Eye, Loader2, LogOut } from 'lucide-react';

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmed', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive' },
  completed: { label: 'Completed', color: 'bg-muted-foreground' },
};

const Admin = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({ title: 'Signed out successfully' });
  };

  useEffect(() => {
    Promise.all([fetchAllBookings(), fetchRooms()])
      .then(([bookingsData, roomsData]) => {
        setBookings(bookingsData);
        setRooms(roomsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const refreshData = async () => {
    const [bookingsData, roomsData] = await Promise.all([fetchAllBookings(), fetchRooms()]);
    setBookings(bookingsData);
    setRooms(roomsData);
  };

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      await updateBookingStatus(id, newStatus, newStatus === 'confirmed' ? 'confirmed' : undefined);
      await refreshData();
      toast({
        title: 'Status Updated',
        description: `Booking is now ${statusConfig[newStatus].label}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update booking status.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(id);
        await refreshData();
        toast({
          title: 'Booking Deleted',
          description: 'Booking has been deleted.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete booking.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleRoomAvailability = async (roomId: string, isAvailable: boolean) => {
    try {
      await updateRoomAvailability(roomId, isAvailable);
      await refreshData();
      toast({
        title: 'Room Updated',
        description: `Room is now ${isAvailable ? 'available' : 'unavailable'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update room.',
        variant: 'destructive',
      });
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.booking_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.booking_status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.booking_status === 'confirmed').length,
    totalRevenue: bookings.filter(b => b.booking_status !== 'cancelled').reduce((sum, b) => sum + b.total_amount, 0),
  };

  const getRoomById = (roomId: string) => rooms.find(r => r.id === roomId);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        <section className="py-12 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-gold uppercase tracking-[0.2em] text-sm font-medium">Management</span>
                <h1 className="text-4xl md:text-5xl font-serif font-bold mt-2">Admin Panel</h1>
                <p className="text-muted-foreground mt-2">Signed in as {user?.email}</p>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gold/10 rounded-lg">
                      <CalendarCheck className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold">{stats.totalBookings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <Users className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <Hotel className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Confirmed</p>
                      <p className="text-2xl font-bold">{stats.confirmedBookings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gold/10 rounded-lg">
                      <DollarSign className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="bookings">
              <TabsList className="mb-6">
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="rooms">Rooms</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                      <CardTitle className="font-serif">All Bookings</CardTitle>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search bookings..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full sm:w-64"
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BookingStatus | 'all')}>
                          <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Filter status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredBookings.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Reference</TableHead>
                              <TableHead>Guest</TableHead>
                              <TableHead>Room</TableHead>
                              <TableHead>Dates</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredBookings.map(booking => {
                              const room = getRoomById(booking.room_id);
                              const typeLabel = room ? room.type.charAt(0).toUpperCase() + room.type.slice(1) : '';
                              return (
                                <TableRow key={booking.id}>
                                  <TableCell className="font-mono text-sm">{booking.reference_number}</TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{booking.guest_name}</p>
                                      <p className="text-sm text-muted-foreground">{booking.guest_phone}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>{typeLabel} ({room?.room_number})</TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <p>{format(new Date(booking.check_in_date), 'MMM d')}</p>
                                      <p className="text-muted-foreground">to {format(new Date(booking.check_out_date), 'MMM d')}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">{formatPrice(booking.total_amount)}</TableCell>
                                  <TableCell>
                                    <Select
                                      value={booking.booking_status}
                                      onValueChange={(v) => handleStatusChange(booking.id, v as BookingStatus)}
                                    >
                                      <SelectTrigger className="w-32">
                                        <Badge className={`${statusConfig[booking.booking_status].color} text-white`}>
                                          {statusConfig[booking.booking_status].label}
                                        </Badge>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="ghost" size="icon" onClick={() => setSelectedBooking(booking)}>
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle className="font-serif">Booking Details</DialogTitle>
                                          </DialogHeader>
                                          {selectedBooking && (
                                            <div className="space-y-4">
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Reference</p>
                                                  <p className="font-mono">{selectedBooking.reference_number}</p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Status</p>
                                                  <Badge className={`${statusConfig[selectedBooking.booking_status].color} text-white`}>
                                                    {statusConfig[selectedBooking.booking_status].label}
                                                  </Badge>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Guest Name</p>
                                                  <p className="font-medium">{selectedBooking.guest_name}</p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Email</p>
                                                  <p>{selectedBooking.guest_email}</p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Phone</p>
                                                  <p>{selectedBooking.guest_phone}</p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Amount</p>
                                                  <p className="font-bold text-gold">{formatPrice(selectedBooking.total_amount)}</p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Check-in</p>
                                                  <p>{format(new Date(selectedBooking.check_in_date), 'PPP')}</p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Check-out</p>
                                                  <p>{format(new Date(selectedBooking.check_out_date), 'PPP')}</p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </DialogContent>
                                      </Dialog>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteBooking(booking.id)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No bookings found.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rooms">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Room Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Room</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price/Night</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rooms.slice(0, 50).map(room => {
                            const typeLabel = room.type.charAt(0).toUpperCase() + room.type.slice(1);
                            return (
                              <TableRow key={room.id}>
                                <TableCell className="font-medium">{room.room_number}</TableCell>
                                <TableCell>{typeLabel}</TableCell>
                                <TableCell>{formatPrice(room.price_per_night)}</TableCell>
                                <TableCell>
                                  <Badge variant={room.is_available ? 'default' : 'destructive'}>
                                    {room.is_available ? 'Available' : 'Unavailable'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRoomAvailability(room.id, !room.is_available)}
                                  >
                                    {room.is_available ? 'Mark Unavailable' : 'Mark Available'}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    {rooms.length > 50 && (
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        Showing first 50 rooms. Use filters to find specific rooms.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;