import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BedDouble, CalendarCheck, DollarSign, Users, TrendingUp, Sparkles } from 'lucide-react';
import { getAnalyticsData, getStaff, getHousekeepingTasks, getCheckInRecords } from '@/lib/erpData';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

export function DashboardModule() {
  const analytics = getAnalyticsData();
  const staff = getStaff();
  const tasks = getHousekeepingTasks();
  const checkIns = getCheckInRecords();

  const activeStaff = staff.filter(s => s.status === 'active').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const todayCheckIns = checkIns.filter(c => c.status === 'expected').length;

  const stats = [
    { label: 'Total Revenue', value: formatPrice(analytics.totalRevenue), icon: DollarSign, color: 'text-green-600' },
    { label: 'Total Bookings', value: analytics.totalBookings, icon: CalendarCheck, color: 'text-blue-600' },
    { label: 'Occupancy Rate', value: `${analytics.occupancyRate}%`, icon: TrendingUp, color: 'text-primary' },
    { label: 'Occupied Rooms', value: `${analytics.occupiedRooms}/${analytics.totalRooms}`, icon: BedDouble, color: 'text-orange-600' },
    { label: 'Active Staff', value: activeStaff, icon: Users, color: 'text-purple-600' },
    { label: 'Pending Tasks', value: pendingTasks, icon: Sparkles, color: 'text-red-600' },
  ];

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
            <p className="text-sm"><span className="font-medium text-yellow-600">{tasks.filter(t => t.status === 'in_progress').length}</span> in progress</p>
            <p className="text-sm"><span className="font-medium text-green-600">{tasks.filter(t => t.status === 'completed').length}</span> completed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
