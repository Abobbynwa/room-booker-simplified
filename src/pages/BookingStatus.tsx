import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchBookingByReference, fetchRoomById } from '@/lib/api';
import { Booking, Room } from '@/types/hotel';
import { Search, Clock, CheckCircle, XCircle, LogIn, LogOut } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending Payment', color: 'bg-yellow-500', icon: <Clock className="h-4 w-4" /> },
  confirmed: { label: 'Confirmed', color: 'bg-green-500', icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-destructive', icon: <XCircle className="h-4 w-4" /> },
  completed: { label: 'Completed', color: 'bg-muted-foreground', icon: <LogOut className="h-4 w-4" /> },
};

const BookingStatus = () => {
  const [reference, setReference] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBooking(null);
    setRoom(null);
    
    if (!reference.trim()) {
      setError('Please enter a reference number');
      return;
    }

    setLoading(true);
    try {
      const found = await fetchBookingByReference(reference.trim().toUpperCase());
      setBooking(found);
      setSearched(true);
      
      if (found) {
        const roomData = await fetchRoomById(found.room_id);
        setRoom(roomData);
      } else {
        setError('No booking found with this reference number');
      }
    } catch (err) {
      setError('Failed to fetch booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const typeLabel = room ? room.type.charAt(0).toUpperCase() + room.type.slice(1) : '';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-8">
              <span className="text-gold uppercase tracking-[0.2em] text-sm font-medium">Track Your Booking</span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mt-2">Check Booking Status</h1>
              <p className="text-muted-foreground mt-4">
                Enter your booking reference number to view your reservation details and status.
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter reference number (e.g., BK12345678)"
                      value={reference}
                      onChange={(e) => setReference(e.target.value.toUpperCase())}
                      className="h-12 font-mono"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-gold hover:bg-gold-dark text-primary-foreground h-12 px-6"
                    disabled={loading}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </form>
                {error && (
                  <p className="text-destructive text-sm mt-3">{error}</p>
                )}
              </CardContent>
            </Card>

            {booking && room && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif">Booking Details</CardTitle>
                    <Badge className={`${statusConfig[booking.booking_status]?.color || 'bg-gray-500'} text-white gap-1`}>
                      {statusConfig[booking.booking_status]?.icon}
                      {statusConfig[booking.booking_status]?.label || booking.booking_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-accent/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Reference Number</p>
                    <p className="text-xl font-mono font-bold text-gold">{booking.reference_number}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Room</p>
                      <p className="font-medium">{typeLabel}</p>
                      <p className="text-sm text-muted-foreground">Room {room.room_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Guest</p>
                      <p className="font-medium">{booking.guest_name}</p>
                      <p className="text-sm text-muted-foreground">{booking.guest_email}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Check-in</p>
                      <p className="font-medium">{format(new Date(booking.check_in_date), 'PPP')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Check-out</p>
                      <p className="font-medium">{format(new Date(booking.check_out_date), 'PPP')}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold text-gold">{formatPrice(booking.total_amount)}</span>
                    </div>
                  </div>

                  {booking.booking_status === 'pending' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-sm">
                        <strong>Payment Pending:</strong> Please complete your payment and send the receipt via WhatsApp to confirm your booking.
                      </p>
                    </div>
                  )}

                  {booking.booking_status === 'confirmed' && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <p className="text-sm">
                        <strong>Booking Confirmed!</strong> Your reservation has been confirmed. We look forward to welcoming you.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {searched && !booking && !loading && (
              <Card className="animate-fade-in">
                <CardContent className="py-12 text-center">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Booking Not Found</h3>
                  <p className="text-muted-foreground">
                    We couldn't find a booking with reference "{reference}". Please check the reference number and try again.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BookingStatus;