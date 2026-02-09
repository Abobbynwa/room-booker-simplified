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
import { erpListStaff, erpCreateStaff, erpDeleteStaff, erpUpdateStaff, erpListStaffDocuments, erpAddStaffDocument, erpDeleteStaffDocument, erpResetStaffCode } from '@/lib/erp-api';
import { getERPToken } from '@/lib/erp-auth';
import { uploadStaffDocument } from '@/lib/erp-upload';
import { ROLE_OPTIONS, DEPARTMENT_OPTIONS, ROLE_LABELS, DEPARTMENT_LABELS } from '@/lib/erp-constants';
import { Plus, Trash2, Edit } from 'lucide-react';

const formatSalary = (s: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(s);

type StaffMember = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  staff_code?: string | null;
  department?: string | null;
  shift?: string | null;
  status: string;
  salary?: number | null;
  hired_at?: string | null;
};

type StaffDocument = { id: number; name: string; url: string; uploaded_at: string };

export function StaffModule() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'receptionist', department: 'front_office', shift: 'morning' as const, status: 'active' as const, salary: '', hired_at: new Date().toISOString().split('T')[0], password: '' });
  const [docsOpen, setDocsOpen] = useState(false);
  const [activeStaff, setActiveStaff] = useState<StaffMember | null>(null);
  const [documents, setDocuments] = useState<StaffDocument[]>([]);

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
    const created = await erpCreateStaff(token, { ...form, salary: Number(form.salary) || 0 });
    toast({ title: 'Staff member added', description: `Staff ID: ${created.staff_code || 'N/A'}` });
    setForm({ name: '', email: '', phone: '', role: 'receptionist', department: 'front_office', shift: 'morning', status: 'active', salary: '', hired_at: new Date().toISOString().split('T')[0], password: '' });
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

  const openDocuments = async (member: StaffMember) => {
    const token = getERPToken();
    if (!token) return;
    setActiveStaff(member);
    const docs = await erpListStaffDocuments(token, member.id);
    setDocuments(docs as StaffDocument[]);
    setDocsOpen(true);
  };

  const handleDocUpload = async (file: File) => {
    if (!activeStaff) return;
    const token = getERPToken();
    if (!token) return;
    const url = await uploadStaffDocument(String(activeStaff.id), file);
    await erpAddStaffDocument(token, activeStaff.id, { name: file.name, url });
    const docs = await erpListStaffDocuments(token, activeStaff.id);
    setDocuments(docs as StaffDocument[]);
  };

  const handleDocDelete = async (docId: number) => {
    if (!activeStaff) return;
    const token = getERPToken();
    if (!token) return;
    await erpDeleteStaffDocument(token, activeStaff.id, docId);
    const docs = await erpListStaffDocuments(token, activeStaff.id);
    setDocuments(docs as StaffDocument[]);
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
                <div>
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map(role => (
                        <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Department</Label>
                  <Select value={form.department ?? ''} onValueChange={v => setForm({ ...form, department: v })}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENT_OPTIONS.map(dept => (
                        <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                          <TableHead>Staff ID</TableHead>
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
                    <TableCell>{ROLE_LABELS[s.role] || ROLE_LABELS[s.role?.toLowerCase()] || s.role}</TableCell>
                    <TableCell className="font-mono text-xs">{s.staff_code || '—'}</TableCell>
                    <TableCell>{s.department ? (DEPARTMENT_LABELS[s.department] || DEPARTMENT_LABELS[s.department?.toLowerCase()] || s.department) : '—'}</TableCell>
                    <TableCell className="capitalize">{s.shift}</TableCell>
                    <TableCell>{formatSalary(s.salary)}</TableCell>
                    <TableCell><Badge variant={statusColor(s.status)} className="capitalize">{s.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => toggleStatus(s)}>
                          {s.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openDocuments(s)}>
                          Documents
                        </Button>
                        <Button size="sm" variant="ghost" onClick={async () => {
                          const token = getERPToken();
                          if (!token) return;
                          const res = await erpResetStaffCode(token, s.id);
                          toast({ title: 'Staff ID reset', description: `New ID: ${res.staff_code}` });
                          refresh();
                        }}>
                          Reset ID
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

      <Dialog open={docsOpen} onOpenChange={setDocsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Staff Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {activeStaff ? `${activeStaff.name} (${activeStaff.email})` : ''}
            </div>
            <label className="text-sm cursor-pointer">
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleDocUpload(e.target.files[0]);
                  e.currentTarget.value = '';
                }}
              />
              Upload document
            </label>
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded.</p>
            ) : (
              <div className="space-y-2">
                {documents.map(d => (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <a className="underline" href={d.url} target="_blank" rel="noreferrer">{d.name}</a>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDocDelete(d.id)}>Delete</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
