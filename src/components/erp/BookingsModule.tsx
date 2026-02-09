import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { erpListBookings, erpUpdateBookingStatus, erpUpdatePaymentProof } from '@/lib/erp-api';
import { getERPToken } from '@/lib/erp-auth';
import { uploadPaymentProof } from '@/lib/erp-upload';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Booking = {
  id: number;
  name: string;
  email: string;
  room_type: string;
  check_in: string;
  check_out: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_proof?: string | null;
};

export function BookingsModule() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState('all');
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const refresh = async () => {
    const token = getERPToken();
    if (!token) return;
    const data = await erpListBookings(token);
    setBookings(data as Booking[]);
  };

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    const token = getERPToken();
    if (!token) return;
    await erpUpdateBookingStatus(token, id, { status });
    toast({ title: `Status updated to ${status}` });
    refresh();
  };

  const handlePaymentConfirm = async (id: number) => {
    const token = getERPToken();
    if (!token) return;
    await erpUpdateBookingStatus(token, id, { status: "confirmed", payment_status: "confirmed" });
    toast({ title: 'Payment confirmed' });
    refresh();
  };

  const viewProof = (proof: string | null | undefined) => {
    if (!proof) return;
    setProofUrl(proof);
  };

  const handleProofUpload = async (bookingId: number, file: File) => {
    const token = getERPToken();
    if (!token) return;
    const url = await uploadPaymentProof(String(bookingId), file);
    await erpUpdatePaymentProof(token, bookingId, { payment_proof: url });
    toast({ title: 'Payment proof uploaded' });
    refresh();
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

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
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">BK-{b.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{b.name}</p>
                          <p className="text-xs text-muted-foreground">{b.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{b.room_type}</TableCell>
                      <TableCell className="text-xs">{b.check_in}<br />→ {b.check_out}</TableCell>
                      <TableCell className="font-medium">—</TableCell>
                      <TableCell>
                        <Select value={b.status} onValueChange={v => handleStatusChange(b.id, v as any)}>
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
                          {b.payment_proof && (
                            <Button size="sm" variant="ghost" onClick={() => viewProof(b.payment_proof)}>
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
                        <label className="text-xs text-muted-foreground cursor-pointer">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleProofUpload(b.id, e.target.files[0]);
                              e.currentTarget.value = '';
                            }}
                          />
                          Upload Proof
                        </label>
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
