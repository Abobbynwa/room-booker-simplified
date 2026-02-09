import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room } from '@/types/hotel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, differenceInDays } from 'date-fns';
import { CalendarIcon, Copy, Check, Upload, X, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';
import { paymentDetails } from '@/lib/api';
import { submitBooking } from '@/lib/backend-api';
import { uploadPublicPaymentProof } from '@/lib/erp-upload';
import { useToast } from '@/hooks/use-toast';

interface BookingFormProps {
  room: Room;
}

export function BookingForm({ room }: BookingFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalAmount = nights * room.price_per_night;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const copyToClipboard = async (text: string, accountId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedAccount(accountId);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleReceiptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Invalid File', description: 'Please upload an image or PDF.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File Too Large', description: 'Max 5MB allowed.', variant: 'destructive' });
      return;
    }

    setReceiptFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setReceiptPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (nights < 1) {
      toast({
        title: 'Invalid Dates',
        description: 'Check-out must be at least one day after check-in.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let paymentProofUrl: string | null = null;
      if (receiptFile) {
        paymentProofUrl = await uploadPublicPaymentProof(guestEmail, receiptFile);
      }

      // Submit to backend FastAPI
      await submitBooking({
        name: guestName,
        email: guestEmail,
        room_type: room.type,
        check_in: format(checkIn, 'yyyy-MM-dd'),
        check_out: format(checkOut, 'yyyy-MM-dd'),
        payment_proof: paymentProofUrl,
      });

      toast({
        title: 'Booking Submitted!',
        description: 'Your booking has been successfully submitted. Check your email for confirmation.',
      });

      // Clear form and navigate
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setCheckIn(undefined);
      setCheckOut(undefined);
      
      navigate('/booking-confirmation');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Booking Failed',
        description: errorMsg || 'Unable to submit booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Guest Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Stay Duration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Check-out Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => date <= (checkIn || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {nights > 0 && (
            <div className="bg-accent/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{formatPrice(room.price_per_night)} × {nights} night{nights > 1 ? 's' : ''}</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                <span>Total</span>
                <span className="text-gold">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Payment Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Transfer to any of the accounts below and send proof via WhatsApp
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentDetails.map((payment, index) => (
            <div key={index} className="bg-accent/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gold">{payment.bankName}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(payment.accountNumber, `${index}`)}
                >
                  {copiedAccount === `${index}` ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm"><span className="text-muted-foreground">Account Name:</span> {payment.accountName}</p>
              <p className="text-sm"><span className="text-muted-foreground">Account Number:</span> {payment.accountNumber}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Payment Receipt</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload a screenshot or photo of your transfer receipt (optional)
          </p>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleReceiptSelect}
            accept="image/*,.pdf"
            className="hidden"
          />

          {receiptFile ? (
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FileImage className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{receiptFile.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    ({(receiptFile.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={removeReceipt}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {receiptPreview && (
                <img src={receiptPreview} alt="Receipt preview" className="max-h-40 rounded-md object-contain mx-auto" />
              )}
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed border-2 h-24 flex flex-col gap-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload receipt</span>
            </Button>
          )}
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full bg-gold hover:bg-gold-dark text-primary-foreground h-12 text-lg"
        disabled={isSubmitting || nights < 1}
      >
        {isSubmitting ? 'Creating Booking...' : 'Complete Booking'}
      </Button>
    </form>
  );
}
