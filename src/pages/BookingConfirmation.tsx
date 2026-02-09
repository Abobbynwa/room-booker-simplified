import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchBookingByReference, fetchRoomById, paymentDetails, contactInfo, uploadPaymentProof } from '@/lib/api';
import { Booking, Room } from '@/types/hotel';
import { CheckCircle, Copy, Check, MessageCircle, Upload, Loader2, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const BookingConfirmation = () => {
  const { reference } = useParams();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }

    fetchBookingByReference(reference)
      .then(async (bookingData) => {
        setBooking(bookingData);
        if (bookingData) {
          setProofUploaded(!!bookingData.payment_proof_url);
          const roomData = await fetchRoomById(bookingData.room_id);
          setRoom(roomData);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [reference]);

  const copyReference = async () => {
    if (reference) {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !reference) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload an image (JPEG, PNG, GIF, WebP) or PDF file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please upload a file smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      await uploadPaymentProof(reference, file);
      setProofUploaded(true);
      toast({
        title: 'Proof Uploaded!',
        description: 'Your payment proof has been uploaded successfully. We will verify it shortly.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload payment proof. Please try again or send via WhatsApp.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20">
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-2xl">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
              <Skeleton className="h-10 w-64 mx-auto mb-8" />
              <Skeleton className="h-48 w-full mb-6" />
              <Skeleton className="h-48 w-full" />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!reference && !loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20">
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-2xl text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Booking Submitted!</h1>
              <p className="text-muted-foreground mb-6">
                Your booking has been received. Please check your email for confirmation and next steps.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link to="/rooms">
                  <Button className="bg-gold hover:bg-gold-dark text-primary-foreground">Back to Rooms</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline">Contact Us</Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

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

  const typeLabel = room.type.charAt(0).toUpperCase() + room.type.slice(1);

  const whatsappMessage = encodeURIComponent(
    `Hello! I just made a booking.\n\nReference: ${booking.reference_number}\nRoom: ${typeLabel} (${room.room_number})\nAmount: ${formatPrice(booking.total_amount)}\n\nI would like to confirm my payment.`
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
                  {booking.reference_number}
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
                  <span className="font-medium">{typeLabel} ({room.room_number})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guest</span>
                  <span className="font-medium">{booking.guest_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium">{format(new Date(booking.check_in_date), 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium">{format(new Date(booking.check_out_date), 'PPP')}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-gold text-lg">{formatPrice(booking.total_amount)}</span>
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
                  <p className="text-sm text-muted-foreground mb-3">Transfer {formatPrice(booking.total_amount)} to any of these accounts:</p>
                  {paymentDetails.map((payment, index) => (
                    <div key={index} className="text-sm mb-2 last:mb-0">
                      <span className="font-medium text-gold">{payment.bankName}:</span> {payment.accountNumber} ({payment.accountName})
                    </div>
                  ))}
                </div>

                <div className="bg-accent/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">2. Upload Payment Proof</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload a screenshot or photo of your payment receipt.
                  </p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  
                  {proofUploaded ? (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 dark:text-green-400 font-medium">Payment proof uploaded successfully!</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full bg-gold hover:bg-gold-dark text-primary-foreground"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Payment Proof
                        </>
                      )}
                    </Button>
                  )}
                  
                  <div className="mt-3 text-center">
                    <span className="text-sm text-muted-foreground">Or send via WhatsApp:</span>
                  </div>
                  <a
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/\+/g, '')}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2"
                  >
                    <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
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
