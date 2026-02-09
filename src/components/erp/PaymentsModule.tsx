import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getERPToken } from "@/lib/erp-auth";
import { erpListBookings, erpUpdateBookingStatus } from "@/lib/erp-api";

type BookingRow = {
  id: number;
  name: string;
  email: string;
  room_type: string;
  check_in: string;
  check_out: string;
  status: string;
  payment_status: string;
  payment_proof?: string | null;
};

const PAYMENT_OPTIONS = [
  { label: "Unpaid", value: "unpaid" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
];

export function PaymentsModule() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingRow[]>([]);

  const refresh = async () => {
    const token = getERPToken();
    if (!token) return;
    const data = await erpListBookings(token);
    setBookings(data as BookingRow[]);
  };

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  const updatePayment = async (booking: BookingRow, payment_status: string) => {
    const token = getERPToken();
    if (!token) return;
    await erpUpdateBookingStatus(token, booking.id, { status: booking.status, payment_status });
    toast({ title: "Payment status updated" });
    refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold">Payments</h1>
        <p className="text-sm text-muted-foreground">Manage payment status and proofs</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Proof</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map(b => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.email}</div>
                    </TableCell>
                    <TableCell>{b.room_type}</TableCell>
                    <TableCell>{b.check_in}</TableCell>
                    <TableCell>{b.check_out}</TableCell>
                    <TableCell>
                      <Select value={b.payment_status} onValueChange={v => updatePayment(b, v)}>
                        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PAYMENT_OPTIONS.map(p => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {b.payment_proof ? (
                        <a href={b.payment_proof} target="_blank" rel="noreferrer" className="text-primary text-xs">View</a>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
