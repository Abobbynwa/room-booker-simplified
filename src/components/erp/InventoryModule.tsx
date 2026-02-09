import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getERPToken } from "@/lib/erp-auth";
import { erpCreateInventory, erpDeleteInventory, erpListInventory, erpUpdateInventory } from "@/lib/erp-api";
import { Plus, Trash2 } from "lucide-react";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: string;
  updated_at?: string;
};

const STATUS_OPTIONS = [
  { label: "Available", value: "available" },
  { label: "Low", value: "low" },
  { label: "Out of Stock", value: "out" },
];

const CATEGORY_OPTIONS = [
  { label: "Kitchen", value: "kitchen" },
  { label: "Bar", value: "bar" },
  { label: "General", value: "general" },
];

export function InventoryModule() {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "kitchen", quantity: "0", unit: "pcs", status: "available" });

  const refresh = async () => {
    const token = getERPToken();
    if (!token) return;
    const data = await erpListInventory(token);
    setItems(data as InventoryItem[]);
  };

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  const handleCreate = async () => {
    if (!form.name) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const token = getERPToken();
    if (!token) return;
    await erpCreateInventory(token, {
      name: form.name,
      category: form.category,
      quantity: Number(form.quantity) || 0,
      unit: form.unit,
      status: form.status,
    });
    toast({ title: "Inventory item added" });
    setForm({ name: "", category: "kitchen", quantity: "0", unit: "pcs", status: "available" });
    setOpen(false);
    refresh();
  };

  const handleUpdate = async (item: InventoryItem, updates: Partial<InventoryItem>) => {
    const token = getERPToken();
    if (!token) return;
    await erpUpdateInventory(token, item.id, updates);
    refresh();
  };

  const handleDelete = async (id: number) => {
    const token = getERPToken();
    if (!token) return;
    await erpDeleteInventory(token, id);
    toast({ title: "Item removed" });
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">{items.length} items</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></div>
                <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
              </div>
              <Button onClick={handleCreate} className="w-full">Add Item</Button>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="capitalize">{item.category}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={e => handleUpdate(item, { quantity: Number(e.target.value) || 0 })}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <Select value={item.status} onValueChange={v => handleUpdate(item, { status: v })}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(item.id)}>
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
