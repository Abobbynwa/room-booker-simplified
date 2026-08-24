import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getERPToken, getERPUser } from "@/lib/erp-auth";
import { erpCreatePaymentAccount, erpDeletePaymentAccount, erpListBookings, erpListPaymentAccounts, erpUpdateBookingStatus } from "@/lib/erp-api";
import { Landmark, Plus, Trash2 } from "lucide-react";

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
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountForm, setAccountForm] = useState({ label: '', bank_name: '', account_name: '', account_number: '', instructions: '' });
  const currentUser = getERPUser();
  const canManageBanks = currentUser?.role === 'admin' || currentUser?.role === 'accountant';

  const refresh = async () => {
    const token = getERPToken();
    if (!token) return;
    const data = await erpListBookings(token);
    setBookings(data as BookingRow[]);
    const paymentAccounts = await erpListPaymentAccounts(token);
    setAccounts(paymentAccounts);
  };

  const createBankAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = getERPToken();
    if (!token || !accountForm.label || !accountForm.bank_name || !accountForm.account_name || !accountForm.account_number) {
      toast({ title: 'Complete the bank account details', variant: 'destructive' });
      return;
    }
    await erpCreatePaymentAccount(token, accountForm);
    toast({ title: 'Bank account added' });
    setAccountForm({ label: '', bank_name: '', account_name: '', account_number: '', instructions: '' });
    refresh();
  };

  const deleteBankAccount = async (id: number) => {
    const token = getERPToken();
    if (!token) return;
    await erpDeletePaymentAccount(token, id);
    toast({ title: 'Bank account removed' });
    refresh();
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
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><Landmark className="h-4 w-4" /></div><div><h2 className="font-semibold">Bank accounts</h2><p className="text-xs text-muted-foreground">Accounts shown to guests for payment instructions</p></div></div>
          {canManageBanks && <form onSubmit={createBankAccount} className="grid gap-3 md:grid-cols-4"><Input placeholder="Label" value={accountForm.label} onChange={e => setAccountForm({ ...accountForm, label: e.target.value })} /><Input placeholder="Bank name" value={accountForm.bank_name} onChange={e => setAccountForm({ ...accountForm, bank_name: e.target.value })} /><Input placeholder="Account name" value={accountForm.account_name} onChange={e => setAccountForm({ ...accountForm, account_name: e.target.value })} /><div className="flex gap-2"><Input placeholder="Account number" value={accountForm.account_number} onChange={e => setAccountForm({ ...accountForm, account_number: e.target.value })} /><Button type="submit" size="icon" aria-label="Add bank account"><Plus className="h-4 w-4" /></Button></div></form>}
          {accounts.length === 0 ? <p className="text-sm text-muted-foreground">No bank accounts configured.</p> : <div className="grid gap-3 md:grid-cols-2">{accounts.map(account => <div key={account.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"><div><p className="font-medium">{account.label || account.bank_name}</p><p className="text-xs text-muted-foreground">{account.bank_name} · {account.account_name}</p><p className="mt-1 font-mono text-sm">{account.account_number}</p></div>{canManageBanks && <Button variant="ghost" size="icon" className="text-destructive" aria-label={`Delete ${account.label || account.bank_name}`} onClick={() => deleteBankAccount(account.id)}><Trash2 className="h-4 w-4" /></Button>}</div>)}</div>}
        </CardContent>
      </Card>

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
