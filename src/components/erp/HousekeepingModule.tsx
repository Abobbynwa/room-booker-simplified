import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { erpListHousekeeping, erpCreateHousekeeping, erpUpdateHousekeeping, erpDeleteHousekeeping } from '@/lib/erp-api';
import { getERPToken } from '@/lib/erp-auth';
import { Plus, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

type HousekeepingTask = {
  id: number;
  room_id: string;
  room_number: string;
  task_type: string;
  status: string;
  priority: string;
  assigned_to: string;
  description: string;
};

export function HousekeepingModule() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [form, setForm] = useState({ room_id: '', room_number: '', type: 'cleaning', priority: 'medium', assigned_to: '', description: '', status: 'pending' });

  const refresh = async () => {
    const token = getERPToken();
    if (!token) return;
    const data = await erpListHousekeeping(token);
    setTasks(data as HousekeepingTask[]);
  };

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  const handleCreate = async () => {
    if (!form.room_number) { toast({ title: 'Room number required', variant: 'destructive' }); return; }
    const token = getERPToken();
    if (!token) return;
    await erpCreateHousekeeping(token, {
      room_id: form.room_id || `room-${form.room_number}`,
      room_number: form.room_number,
      task_type: form.type,
      status: form.status,
      priority: form.priority,
      assigned_to: form.assigned_to,
      description: form.description,
    });
    toast({ title: 'Task created' });
    setOpen(false);
    refresh();
  };

  const handleStatusChange = async (id: number, status: string) => {
    const token = getERPToken();
    if (!token) return;
    await erpUpdateHousekeeping(token, id, { status });
    toast({ title: `Task marked as ${status}` });
    refresh();
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const priorityColor = (p: string) => p === 'urgent' ? 'destructive' : p === 'high' ? 'default' : 'secondary';
  const statusIcon = (s: string) => s === 'completed' ? <CheckCircle className="h-4 w-4 text-green-600" /> : s === 'in_progress' ? <Clock className="h-4 w-4 text-yellow-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Housekeeping</h1>
          <p className="text-sm text-muted-foreground">{tasks.filter(t => t.status !== 'completed').length} active tasks</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Room Number</Label><Input value={form.room_number} onChange={e => setForm({ ...form, room_number: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                        <SelectItem value="turnover">Turnover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Assigned To</Label><Input value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} /></div>
                <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <Button onClick={handleCreate} className="w-full">Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">Room {t.room_number}</TableCell>
                    <TableCell className="capitalize">{t.task_type}</TableCell>
                    <TableCell><Badge variant={priorityColor(t.priority)} className="capitalize">{t.priority}</Badge></TableCell>
                    <TableCell>{t.assigned_to}</TableCell>
                    <TableCell><div className="flex items-center gap-1">{statusIcon(t.status)}<span className="capitalize text-sm">{t.status.replace('_', ' ')}</span></div></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {t.status === 'pending' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(t.id, 'in_progress')}>Start</Button>}
                        {t.status === 'in_progress' && <Button size="sm" onClick={() => handleStatusChange(t.id, 'completed')}>Complete</Button>}
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => { 
                          const token = getERPToken(); 
                          if (!token) return; 
                          await erpDeleteHousekeeping(token, t.id); 
                          toast({ title: 'Task deleted' }); 
                          refresh(); 
                        }}>
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
