import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBookingByReference } from '@/lib/bookingStore';
import { rooms, paymentDetails, contactInfo } from '@/data/rooms';
import { CheckCircle, Copy, Check, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

const BookingConfirmation = () => {
  const { referenceNumber } = useParams();
  const booking = referenceNumber ? getBookingByReference(referenceNumber) : null;
  const room = booking ? rooms.find(r => r.id === booking.roomId) : null;
  const [copied, setCopied] = useState(false);

  const copyReference = async () => {
    if (referenceNumber) {
      await navigator.clipboard.writeText(referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!booking || !room) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold mb-4">Booking Not Found</h1>
            <p className="text-muted-foreground mb-6">We couldn't find this booking reference.</p>
            <Link to="/rooms">
              <Button className="bg-gold hover:bg-gold-dark text-primary-foreground">Browse Rooms</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hello! I just made a booking at Luxe Haven.\n\nReference: ${booking.referenceNumber}\nRoom: ${room.type} (${room.roomNumber})\nAmount: ${formatPrice(booking.totalAmount)}\n\nI would like to confirm my payment.`
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Booking Created!</h1>
              <p className="text-muted-foreground">
                Your booking is pending payment confirmation.
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="font-serif flex items-center justify-between">
                  <span>Your Reference Number</span>
                  <Button variant="ghost" size="sm" onClick={copyReference}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-mono font-bold text-gold text-center py-4 bg-accent/30 rounded-lg">
                  {booking.referenceNumber}
                </p>
                <p className="text-sm text-muted-foreground text-center mt-3">
                  Save this reference number to check your booking status later.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="font-serif">Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room</span>
                  <span className="font-medium">{room.type} ({room.roomNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guest</span>
                  <span className="font-medium">{booking.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium">{format(new Date(booking.checkIn), 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium">{format(new Date(booking.checkOut), 'PPP')}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-gold text-lg">{formatPrice(booking.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="font-serif">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">1. Make Payment</h4>
                  <p className="text-sm text-muted-foreground mb-3">Transfer {formatPrice(booking.totalAmount)} to any of these accounts:</p>
                  {paymentDetails.map((payment, index) => (
                    <div key={index} className="text-sm mb-2 last:mb-0">
                      <span className="font-medium text-gold">{payment.bankName}:</span> {payment.accountNumber} ({payment.accountName})
                    </div>
                  ))}
                </div>

                <div className="bg-accent/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">2. Send Payment Proof</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send your payment receipt via WhatsApp with your reference number.
                  </p>
                  <a
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/\+/g, '')}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send on WhatsApp
                    </Button>
                  </a>
                </div>

                <div className="bg-accent/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">3. Wait for Confirmation</h4>
                  <p className="text-sm text-muted-foreground">
                    Once we verify your payment, your booking status will be updated to "Confirmed". You can check your status anytime using your reference number.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/booking-status" className="flex-1">
                <Button variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-primary-foreground">
                  Check Booking Status
                </Button>
              </Link>
              <Link to="/rooms" className="flex-1">
                <Button className="w-full bg-gold hover:bg-gold-dark text-primary-foreground">
                  Browse More Rooms
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BookingConfirmation;
