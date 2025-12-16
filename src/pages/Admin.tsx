import { useState, useEffect } from 'react';
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
import { getBookings, updateBookingStatus, deleteBooking, updateRoomAvailability, getRoomAvailability } from '@/lib/bookingStore';
import { rooms as allRooms } from '@/data/rooms';
import { Booking, BookingStatus, Room } from '@/types/hotel';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Search, Hotel, CalendarCheck, Users, DollarSign, Trash2, Eye } from 'lucide-react';

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmed', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive' },
  'checked-in': { label: 'Checked In', color: 'bg-blue-500' },
  'checked-out': { label: 'Checked Out', color: 'bg-muted-foreground' },
};

const Admin = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [roomAvailability, setRoomAvailability] = useState<Record<string, boolean>>({});
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    setBookings(getBookings());
    setRoomAvailability(getRoomAvailability());
  }, []);

  const refreshBookings = () => {
    setBookings(getBookings());
  };

  const handleStatusChange = (referenceNumber: string, newStatus: BookingStatus) => {
    updateBookingStatus(referenceNumber, newStatus);
    refreshBookings();
    toast({
      title: 'Status Updated',
      description: `Booking ${referenceNumber} is now ${statusConfig[newStatus].label}.`,
    });
  };

  const handleDeleteBooking = (referenceNumber: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      deleteBooking(referenceNumber);
      refreshBookings();
      toast({
        title: 'Booking Deleted',
        description: `Booking ${referenceNumber} has been deleted.`,
      });
    }
  };

  const handleRoomAvailability = (roomId: string, isAvailable: boolean) => {
    updateRoomAvailability(roomId, isAvailable);
    setRoomAvailability(prev => ({ ...prev, [roomId]: isAvailable }));
    toast({
      title: 'Room Updated',
      description: `Room is now ${isAvailable ? 'available' : 'unavailable'}.`,
    });
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
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
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    totalRevenue: bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.totalAmount, 0),
  };

  const getRoomWithAvailability = (room: Room) => ({
    ...room,
    isAvailable: roomAvailability[room.id] !== undefined ? roomAvailability[room.id] : room.isAvailable,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        <section className="py-12 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <span className="text-gold uppercase tracking-[0.2em] text-sm font-medium">Management</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mt-2">Admin Panel</h1>
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
                            <SelectItem value="checked-in">Checked In</SelectItem>
                            <SelectItem value="checked-out">Checked Out</SelectItem>
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
                              const room = allRooms.find(r => r.id === booking.roomId);
                              return (
                                <TableRow key={booking.id}>
                                  <TableCell className="font-mono text-sm">{booking.referenceNumber}</TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{booking.guestName}</p>
                                      <p className="text-sm text-muted-foreground">{booking.guestPhone}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>{room?.type} ({room?.roomNumber})</TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <p>{format(new Date(booking.checkIn), 'MMM d')}</p>
                                      <p className="text-muted-foreground">to {format(new Date(booking.checkOut), 'MMM d')}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">{formatPrice(booking.totalAmount)}</TableCell>
                                  <TableCell>
                                    <Select
                                      value={booking.status}
                                      onValueChange={(v) => handleStatusChange(booking.referenceNumber, v as BookingStatus)}
                                    >
                                      <SelectTrigger className="w-32">
                                        <Badge className={`${statusConfig[booking.status].color} text-white`}>
                                          {statusConfig[booking.status].label}
                                        </Badge>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="checked-in">Checked In</SelectItem>
                                        <SelectItem value="checked-out">Checked Out</SelectItem>
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
                                                  <p className="font-mono">{selectedBooking.referenceNumber}</p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Status</p>
                                                  <Badge className={`${statusConfig[selectedBooking.status].color} text-white`}>
                                                    {statusConfig[selectedBooking.status].label}
                                                  </Badge>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Guest Name</p>
                                                  <p className="font-medium">{selectedBooking.guestName}</p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Email</p>
                                                  <p>{selectedBooking.guestEmail}</p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Phone</p>
                                                  <p>{selectedBooking.guestPhone}</p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Amount</p>
                                                  <p className="font-bold text-gold">{formatPrice(selectedBooking.totalAmount)}</p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Check-in</p>
                                                  <p>{format(new Date(selectedBooking.checkIn), 'PPP')}</p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">Check-out</p>
                                                  <p>{format(new Date(selectedBooking.checkOut), 'PPP')}</p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </DialogContent>
                                      </Dialog>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteBooking(booking.referenceNumber)}
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
                          {allRooms.slice(0, 50).map(room => {
                            const roomWithAvail = getRoomWithAvailability(room);
                            return (
                              <TableRow key={room.id}>
                                <TableCell className="font-medium">{room.roomNumber}</TableCell>
                                <TableCell>{room.type}</TableCell>
                                <TableCell>{formatPrice(room.price)}</TableCell>
                                <TableCell>
                                  <Badge variant={roomWithAvail.isAvailable ? 'default' : 'destructive'}>
                                    {roomWithAvail.isAvailable ? 'Available' : 'Unavailable'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRoomAvailability(room.id, !roomWithAvail.isAvailable)}
                                  >
                                    {roomWithAvail.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">Showing first 50 rooms. Full room management requires backend integration.</p>
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
