import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BedDouble, CalendarCheck, DollarSign, Users, TrendingUp, Sparkles } from 'lucide-react';
import { erpReportSummary, erpListStaff, erpListHousekeeping, erpListCheckins, erpListRooms } from '@/lib/erp-api';
import { getERPToken } from '@/lib/erp-auth';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

export function DashboardModule() {
  const [stats, setStats] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [inProgressTasks, setInProgressTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [todayCheckIns, setTodayCheckIns] = useState(0);

  useEffect(() => {
    const token = getERPToken();
    if (!token) return;
    Promise.all([
      erpReportSummary(token),
      erpListStaff(token),
      erpListHousekeeping(token),
      erpListCheckins(token),
      erpListRooms(token),
    ]).then(([report, staff, tasks, checkins, rooms]) => {
      const activeStaff = staff.filter((s: any) => s.status === 'active').length;
      const pending = tasks.filter((t: any) => t.status === 'pending').length;
      const inProgress = tasks.filter((t: any) => t.status === 'in_progress').length;
      const completed = tasks.filter((t: any) => t.status === 'completed').length;
      const expected = checkins.filter((c: any) => c.status === 'expected').length;
      setPendingTasks(pending);
      setInProgressTasks(inProgress);
      setCompletedTasks(completed);
      setTodayCheckIns(expected);

      const occupiedRooms = rooms.filter((r: any) => !r.is_available).length;
      setStats([
        { label: 'Estimated Revenue', value: formatPrice(report.estimated_revenue || 0), icon: DollarSign, color: 'text-green-600' },
        { label: 'Total Bookings', value: report.total_bookings || 0, icon: CalendarCheck, color: 'text-blue-600' },
        { label: 'Occupancy Rate', value: `${((report.occupancy_rate || 0) * 100).toFixed(1)}%`, icon: TrendingUp, color: 'text-primary' },
        { label: 'Occupied Rooms', value: `${occupiedRooms}/${rooms.length}`, icon: BedDouble, color: 'text-orange-600' },
        { label: 'Active Staff', value: activeStaff, icon: Users, color: 'text-purple-600' },
        { label: 'Pending Tasks', value: pending, icon: Sparkles, color: 'text-red-600' },
      ]);
    }).catch(() => undefined);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of hotel operations</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {stats.map(s => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expected Arrivals Today</CardTitle>
          </CardHeader>
          <CardContent>
            {todayCheckIns === 0 ? (
              <p className="text-sm text-muted-foreground">No arrivals expected</p>
            ) : (
              <p className="text-2xl font-bold text-primary">{todayCheckIns} guests</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Housekeeping Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm"><span className="font-medium text-red-600">{pendingTasks}</span> pending</p>
            <p className="text-sm"><span className="font-medium text-yellow-600">{inProgressTasks}</span> in progress</p>
            <p className="text-sm"><span className="font-medium text-green-600">{completedTasks}</span> completed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
