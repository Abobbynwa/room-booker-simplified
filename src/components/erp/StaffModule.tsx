import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { erpListStaff, erpCreateStaff, erpDeleteStaff, erpUpdateStaff } from '@/lib/erp-api';
import { getERPToken } from '@/lib/erp-auth';
import { Plus, Trash2, Edit } from 'lucide-react';

const formatSalary = (s: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(s);

type StaffMember = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department?: string | null;
  shift?: string | null;
  status: string;
  salary?: number | null;
  hired_at?: string | null;
};

export function StaffModule() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'Receptionist', department: 'Reception', shift: 'morning' as const, status: 'active' as const, salary: '', hired_at: new Date().toISOString().split('T')[0], password: '' });

  const refresh = async () => {
    const token = getERPToken();
    if (!token) return;
    const data = await erpListStaff(token);
    setStaff(data as StaffMember[]);
  };

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email) { toast({ title: 'Name and email required', variant: 'destructive' }); return; }
    const token = getERPToken();
    if (!token) return;
    await erpCreateStaff(token, { ...form, salary: Number(form.salary) || 0 });
    toast({ title: 'Staff member added' });
    setForm({ name: '', email: '', phone: '', role: 'Receptionist', department: 'Reception', shift: 'morning', status: 'active', salary: '', hired_at: new Date().toISOString().split('T')[0], password: '' });
    setOpen(false);
    refresh();
  };

  const handleDelete = async (id: number) => { 
    const token = getERPToken();
    if (!token) return;
    await erpDeleteStaff(token, id); 
    toast({ title: 'Staff removed' }); 
    refresh(); 
  };

  const toggleStatus = async (s: StaffMember) => {
    const next = s.status === 'active' ? 'inactive' : 'active';
    const token = getERPToken();
    if (!token) return;
    await erpUpdateStaff(token, s.id, { status: next });
    toast({ title: `Status changed to ${next}` });
    refresh();
  };

  const statusColor = (s: string) => s === 'active' ? 'default' : s === 'on_leave' ? 'secondary' : 'destructive';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Staff Management</h1>
          <p className="text-sm text-muted-foreground">{staff.length} staff members</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Staff</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Role</Label><Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div>
                <div><Label>Department</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Shift</Label>
                  <Select value={form.shift} onValueChange={v => setForm({ ...form, shift: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Salary (₦)</Label><Input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} /></div>
              </div>
              <div><Label>Password (optional)</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
              <Button onClick={handleCreate} className="w-full">Add Staff Member</Button>
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
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{s.role}</TableCell>
                    <TableCell>{s.department}</TableCell>
                    <TableCell className="capitalize">{s.shift}</TableCell>
                    <TableCell>{formatSalary(s.salary)}</TableCell>
                    <TableCell><Badge variant={statusColor(s.status)} className="capitalize">{s.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => toggleStatus(s)}>
                          {s.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
