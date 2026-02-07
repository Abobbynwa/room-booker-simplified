import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  getOrCreateGuestProfile,
  updateGuestProfile,
  addGuestReceipt,
  GuestProfile,
} from '@/lib/erpData';
import {
  User,
  Mail,
  Phone,
  FileText,
  Upload,
  Plus,
  X,
  History,
  Heart,
  StickyNote,
  Receipt,
} from 'lucide-react';

const PREFERENCE_OPTIONS = [
  'Late check-out',
  'Early check-in',
  'Extra pillows',
  'High floor',
  'Low floor',
  'Away from elevator',
  'Non-smoking',
  'Quiet room',
  'Extra towels',
  'Airport pickup',
  'Vegetarian meals',
  'Baby cot',
];

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

interface GuestProfileCardProps {
  guestName: string;
  trigger?: React.ReactNode;
}

export function GuestProfileCard({ guestName, trigger }: GuestProfileCardProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState(false);

  const load = () => {
    const p = getOrCreateGuestProfile(guestName);
    setProfile(p);
    setNotes(p.notes);
  };

  const handleOpen = (o: boolean) => {
    setOpen(o);
    if (o) load();
  };

  const togglePref = (pref: string) => {
    if (!profile) return;
    const prefs = profile.preferences.includes(pref)
      ? profile.preferences.filter(p => p !== pref)
      : [...profile.preferences, pref];
    updateGuestProfile(profile.id, { preferences: prefs });
    setProfile({ ...profile, preferences: prefs });
  };

  const saveNotes = () => {
    if (!profile) return;
    updateGuestProfile(profile.id, { notes });
    setProfile({ ...profile, notes });
    toast({ title: 'Notes saved' });
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const receipt = {
        id: `rcpt-${Date.now()}`,
        name: file.name,
        data_url: reader.result as string,
        uploaded_at: new Date().toISOString(),
      };
      addGuestReceipt(profile.id, receipt);
      setProfile({ ...profile, receipts: [...profile.receipts, receipt] });
      toast({ title: 'Receipt uploaded' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeReceipt = (receiptId: string) => {
    if (!profile) return;
    const receipts = profile.receipts.filter(r => r.id !== receiptId);
    updateGuestProfile(profile.id, { receipts });
    setProfile({ ...profile, receipts });
  };

  const statusBadge = (status: string) => {
    const v = { pending: 'secondary', confirmed: 'default', cancelled: 'destructive', completed: 'outline' } as const;
    return <Badge variant={(v as any)[status] || 'secondary'} className="capitalize text-[10px]">{status}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="ghost" className="gap-1">
            <User className="h-3.5 w-3.5" />Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif">
            <User className="h-5 w-5" />
            Guest Profile
          </DialogTitle>
        </DialogHeader>

        {profile && (
          <div className="space-y-4">
            {/* Header card */}
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-lg font-semibold">{profile.guest_name}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {profile.email && (
                        <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{profile.email}</span>
                      )}
                      {profile.phone && (
                        <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{profile.phone}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {profile.booking_history.length} booking{profile.booking_history.length !== 1 ? 's' : ''} · Guest since {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="history">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="history" className="gap-1 text-xs"><History className="h-3.5 w-3.5" />History</TabsTrigger>
                <TabsTrigger value="preferences" className="gap-1 text-xs"><Heart className="h-3.5 w-3.5" />Prefs</TabsTrigger>
                <TabsTrigger value="notes" className="gap-1 text-xs"><StickyNote className="h-3.5 w-3.5" />Notes</TabsTrigger>
                <TabsTrigger value="receipts" className="gap-1 text-xs"><Receipt className="h-3.5 w-3.5" />Receipts</TabsTrigger>
              </TabsList>

              {/* Booking History */}
              <TabsContent value="history" className="mt-3">
                {profile.booking_history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No booking history</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Room</TableHead>
                          <TableHead>Check-in</TableHead>
                          <TableHead>Check-out</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profile.booking_history.map(b => (
                          <TableRow key={b.booking_id}>
                            <TableCell className="font-medium">{b.room_number}</TableCell>
                            <TableCell className="text-xs">{new Date(b.check_in).toLocaleDateString()}</TableCell>
                            <TableCell className="text-xs">{new Date(b.check_out).toLocaleDateString()}</TableCell>
                            <TableCell className="text-xs">{formatPrice(b.amount)}</TableCell>
                            <TableCell>{statusBadge(b.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Preferences */}
              <TabsContent value="preferences" className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {PREFERENCE_OPTIONS.map(pref => (
                    <Badge
                      key={pref}
                      variant={profile.preferences.includes(pref) ? 'default' : 'outline'}
                      className="cursor-pointer select-none"
                      onClick={() => togglePref(pref)}
                    >
                      {profile.preferences.includes(pref) ? '✓ ' : '+ '}{pref}
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              {/* Notes */}
              <TabsContent value="notes" className="mt-3 space-y-3">
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add notes about this guest..."
                  rows={5}
                />
                <Button size="sm" onClick={saveNotes}>Save Notes</Button>
              </TabsContent>

              {/* Receipts */}
              <TabsContent value="receipts" className="mt-3 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleReceiptUpload}
                />
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-1">
                  <Upload className="h-4 w-4" />Upload Receipt
                </Button>
                {profile.receipts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No receipts uploaded</p>
                ) : (
                  <div className="grid gap-2">
                    {profile.receipts.map(r => (
                      <div key={r.id} className="flex items-center gap-3 p-2 rounded-md border">
                        {r.data_url.startsWith('data:image') ? (
                          <img src={r.data_url} alt={r.name} className="h-12 w-12 object-cover rounded" />
                        ) : (
                          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(r.uploaded_at).toLocaleDateString()}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => removeReceipt(r.id)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
