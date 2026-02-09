import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { erpListCheckins, erpUpdateCheckin } from '@/lib/erp-api';
import { getERPToken } from '@/lib/erp-auth';
import { GuestProfileCard } from './GuestProfileCard';
import { LogIn, LogOut, User } from 'lucide-react';

type CheckInRecord = {
  id: number;
  booking_id: number;
  guest_name: string;
  room_id: string;
  room_number: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  status: 'expected' | 'checked_in' | 'checked_out' | 'no_show';
  notes: string | null;
};

export function CheckInOutModule() {
  const { toast } = useToast();
  const [records, setRecords] = useState<CheckInRecord[]>([]);

  const refresh = async () => {
    const token = getERPToken();
    if (!token) return;
    const data = await erpListCheckins(token);
    setRecords(data as CheckInRecord[]);
  };

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  const handleCheckIn = async (id: number, name: string) => {
    const token = getERPToken();
    if (!token) return;
    await erpUpdateCheckin(token, id, { status: 'checked_in' });
    toast({ title: `${name} checked in`, description: `Room assigned at ${new Date().toLocaleTimeString()}` });
    refresh();
  };

  const handleCheckOut = async (id: number, name: string) => {
    const token = getERPToken();
    if (!token) return;
    await erpUpdateCheckin(token, id, { status: 'checked_out' });
    toast({ title: `${name} checked out`, description: 'Room is now available for cleaning' });
    refresh();
  };

  const statusBadge = (status: CheckInRecord['status']) => {
    const map = { expected: 'secondary', checked_in: 'default', checked_out: 'outline', no_show: 'destructive' } as const;
    return <Badge variant={map[status] || 'secondary'} className="capitalize">{status.replace('_', ' ')}</Badge>;
  };

  const expected = records.filter(r => r.status === 'expected');
  const checkedIn = records.filter(r => r.status === 'checked_in');
  const checkedOut = records.filter(r => r.status === 'checked_out');

  const renderTable = (list: CheckInRecord[], showCheckIn: boolean, showCheckOut: boolean) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No records</TableCell></TableRow>
          ) : list.map(r => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.guest_name}</TableCell>
              <TableCell>Room {r.room_number}</TableCell>
              <TableCell>{statusBadge(r.status)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : '—'}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <GuestProfileCard guestName={r.guest_name} />
                  {showCheckIn && (
                    <Button size="sm" onClick={() => handleCheckIn(r.id, r.guest_name)}>
                      <LogIn className="h-4 w-4 mr-1" />Check In
                    </Button>
                  )}
                  {showCheckOut && (
                    <Button size="sm" variant="outline" onClick={() => handleCheckOut(r.id, r.guest_name)}>
                      <LogOut className="h-4 w-4 mr-1" />Check Out
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold">Check-in / Check-out</h1>
        <p className="text-sm text-muted-foreground">Manage guest arrivals and departures</p>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expected</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-yellow-600">{expected.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Checked In</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{checkedIn.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Checked Out</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-muted-foreground">{checkedOut.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="expected">
            <TabsList>
              <TabsTrigger value="expected">Expected ({expected.length})</TabsTrigger>
              <TabsTrigger value="checked_in">In-House ({checkedIn.length})</TabsTrigger>
              <TabsTrigger value="checked_out">Departed ({checkedOut.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="expected" className="mt-4">{renderTable(expected, true, false)}</TabsContent>
            <TabsContent value="checked_in" className="mt-4">{renderTable(checkedIn, false, true)}</TabsContent>
            <TabsContent value="checked_out" className="mt-4">{renderTable(checkedOut, false, false)}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
