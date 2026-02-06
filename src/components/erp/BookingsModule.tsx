import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getBookings, updateBookingStatus, deleteBooking, getPaymentProof, getRoomById } from '@/lib/mockData';
import { Booking } from '@/types/hotel';
import { Trash2, Eye, Mail, Phone, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const formatPrice = (p: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(p);

export function BookingsModule() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState(getBookings());
  const [filter, setFilter] = useState('all');
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const refresh = () => setBookings(getBookings());

  const handleStatusChange = (id: string, status: Booking['booking_status']) => {
    updateBookingStatus(id, status);
    const booking = bookings.find(b => b.id === id);
    if (booking && (status === 'confirmed' || status === 'cancelled')) {
      toast({
        title: `Booking ${status}`,
        description: `📧 Email sent to ${booking.guest_email}\n📱 SMS sent to ${booking.guest_phone}`,
      });
    } else {
      toast({ title: `Status updated to ${status}` });
    }
    refresh();
  };

  const handlePaymentConfirm = (id: string) => {
    updateBookingStatus(id, 'confirmed', 'confirmed');
    toast({ title: 'Payment confirmed' });
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteBooking(id);
    toast({ title: 'Booking deleted' });
    refresh();
  };

  const viewProof = (ref: string | null) => {
    if (!ref) return;
    const proof = getPaymentProof(ref);
    setProofUrl(proof);
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.booking_status === filter);

  const statusColor = (s: string) => {
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = { pending: 'secondary', confirmed: 'default', cancelled: 'destructive', completed: 'outline' };
    return map[s] || 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Bookings</h1>
          <p className="text-sm text-muted-foreground">{bookings.length} total bookings</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
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
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No bookings found</TableCell></TableRow>
                ) : filtered.map(b => {
                  const room = getRoomById(b.room_id);
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">{b.reference_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{b.guest_name}</p>
                          <p className="text-xs text-muted-foreground">{b.guest_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{room?.name || 'N/A'}<br /><span className="text-xs text-muted-foreground">#{room?.room_number}</span></TableCell>
                      <TableCell className="text-xs">{b.check_in_date}<br />→ {b.check_out_date}</TableCell>
                      <TableCell className="font-medium">{formatPrice(b.total_amount)}</TableCell>
                      <TableCell>
                        <Select value={b.booking_status} onValueChange={v => handleStatusChange(b.id, v as any)}>
                          <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge variant={b.payment_status === 'confirmed' ? 'default' : 'secondary'} className="capitalize text-xs">{b.payment_status}</Badge>
                          {b.payment_proof_url && (
                            <Button size="sm" variant="ghost" onClick={() => viewProof(b.payment_proof_url)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          {b.payment_status === 'pending' && (
                            <Button size="sm" variant="outline" className="text-xs h-6" onClick={() => handlePaymentConfirm(b.id)}>
                              Confirm
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(b.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!proofUrl} onOpenChange={() => setProofUrl(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Payment Proof</DialogTitle></DialogHeader>
          {proofUrl && <img src={proofUrl} alt="Payment proof" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
