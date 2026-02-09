import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getERPToken } from '@/lib/erp-auth';
import { erpListGuests, erpCreateGuest, erpUpdateGuest, erpAddReceipt, erpListReceipts, erpDeleteReceipt } from '@/lib/erp-api';
import { User, Mail, Phone, FileText, Upload, X, Heart, StickyNote, Receipt } from 'lucide-react';

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

type GuestProfile = {
  id: number;
  guest_name: string;
  email: string;
  phone: string;
  preferences: string[];
  notes: string;
  created_at: string;
};

type GuestReceipt = { id: number; name: string; data_url: string; uploaded_at: string };

interface GuestProfileCardProps {
  guestName: string;
  trigger?: React.ReactNode;
}

export function GuestProfileCard({ guestName, trigger }: GuestProfileCardProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [notes, setNotes] = useState('');
  const [receipts, setReceipts] = useState<GuestReceipt[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const token = getERPToken();
    if (!token) return;
    const guests = await erpListGuests(token);
    let p = guests.find((g: any) => String(g.guest_name).toLowerCase() === guestName.toLowerCase());
    if (!p) {
      p = await erpCreateGuest(token, { guest_name: guestName, email: '', phone: '' });
    }
    const prefs = p.preferences ? String(p.preferences).split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const model: GuestProfile = {
      id: p.id,
      guest_name: p.guest_name,
      email: p.email || '',
      phone: p.phone || '',
      preferences: prefs,
      notes: p.notes || '',
      created_at: p.created_at,
    };
    setProfile(model);
    setNotes(model.notes);
    const r = await erpListReceipts(token, model.id);
    setReceipts(r as GuestReceipt[]);
  };

  const handleOpen = (o: boolean) => {
    setOpen(o);
    if (o) load();
  };

  const togglePref = async (pref: string) => {
    if (!profile) return;
    const prefs = profile.preferences.includes(pref)
      ? profile.preferences.filter(p => p !== pref)
      : [...profile.preferences, pref];
    const token = getERPToken();
    if (!token) return;
    await erpUpdateGuest(token, profile.id, { preferences: prefs.join(',') });
    setProfile({ ...profile, preferences: prefs });
  };

  const saveNotes = async () => {
    if (!profile) return;
    const token = getERPToken();
    if (!token) return;
    await erpUpdateGuest(token, profile.id, { notes });
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
    reader.onload = async () => {
      const token = getERPToken();
      if (!token) return;
      await erpAddReceipt(token, profile.id, { name: file.name, data_url: reader.result as string });
      const r = await erpListReceipts(token, profile.id);
      setReceipts(r as GuestReceipt[]);
      toast({ title: 'Receipt uploaded' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeReceipt = async (receiptId: number) => {
    if (!profile) return;
    const token = getERPToken();
    if (!token) return;
    await erpDeleteReceipt(token, profile.id, receiptId);
    const r = await erpListReceipts(token, profile.id);
    setReceipts(r as GuestReceipt[]);
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
                      Guest since {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="preferences">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="preferences" className="gap-1 text-xs"><Heart className="h-3.5 w-3.5" />Prefs</TabsTrigger>
                <TabsTrigger value="notes" className="gap-1 text-xs"><StickyNote className="h-3.5 w-3.5" />Notes</TabsTrigger>
                <TabsTrigger value="receipts" className="gap-1 text-xs"><Receipt className="h-3.5 w-3.5" />Receipts</TabsTrigger>
              </TabsList>

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

              <TabsContent value="notes" className="mt-3 space-y-3">
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes about this guest" />
                <Button onClick={saveNotes}>Save Notes</Button>
              </TabsContent>

              <TabsContent value="receipts" className="mt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Input ref={fileInputRef} type="file" className="hidden" onChange={handleReceiptUpload} />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />Upload Receipt
                  </Button>
                </div>
                {receipts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No receipts uploaded</p>
                ) : (
                  <div className="space-y-2">
                    {receipts.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{r.name}</p>
                            <p className="text-xs text-muted-foreground">{new Date(r.uploaded_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => window.open(r.data_url, '_blank')}>
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeReceipt(r.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
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
