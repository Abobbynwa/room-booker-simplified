import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getERPToken } from "@/lib/erp-auth";
import { erpCreateAnnouncement, erpDeleteAnnouncement, erpListAnnouncements, erpUpdateAnnouncement } from "@/lib/erp-api";
import { Plus, Trash2 } from "lucide-react";

type Announcement = {
  id: number;
  title: string;
  message: string;
  audience: string;
  is_active: boolean;
  expires_at?: string | null;
  created_at?: string;
};

export function AnnouncementsModule() {
  const { toast } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "staff",
    is_active: true,
    expires_at: "",
  });

  const refresh = async () => {
    const token = getERPToken();
    if (!token) return;
    const data = await erpListAnnouncements(token);
    setItems(data as Announcement[]);
  };

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.message) {
      toast({ title: "Title and message required", variant: "destructive" });
      return;
    }
    const token = getERPToken();
    if (!token) return;
    await erpCreateAnnouncement(token, {
      title: form.title,
      message: form.message,
      audience: form.audience,
      is_active: form.is_active,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    });
    toast({ title: "Announcement created" });
    setForm({ title: "", message: "", audience: "staff", is_active: true, expires_at: "" });
    setOpen(false);
    refresh();
  };

  const handleToggle = async (item: Announcement) => {
    const token = getERPToken();
    if (!token) return;
    await erpUpdateAnnouncement(token, item.id, { is_active: !item.is_active });
    refresh();
  };

  const handleDelete = async (id: number) => {
    const token = getERPToken();
    if (!token) return;
    await erpDeleteAnnouncement(token, id);
    toast({ title: "Announcement deleted" });
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Announcements</h1>
          <p className="text-sm text-muted-foreground">Send staff or public alerts</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Announcement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Message</Label><Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Audience</Label>
                  <Select value={form.audience} onValueChange={v => setForm({ ...form, audience: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Active</Label>
                  <Select value={form.is_active ? "yes" : "no"} onValueChange={v => setForm({ ...form, is_active: v === "yes" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Expires At (optional)</Label><Input type="datetime-local" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} /></div>
              <Button onClick={handleCreate} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.message}</div>
                    </TableCell>
                    <TableCell className="capitalize">{a.audience}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => handleToggle(a)}>
                        {a.is_active ? "Active" : "Inactive"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-xs">{a.expires_at ? new Date(a.expires_at).toLocaleString() : "—"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
