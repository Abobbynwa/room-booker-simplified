import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { erpReportSummary } from '@/lib/erp-api';
import { getERPToken } from '@/lib/erp-auth';

export function AnalyticsModule() {
  const [report, setReport] = useState<any | null>(null);

  useEffect(() => {
    const token = getERPToken();
    if (!token) return;
    erpReportSummary(token).then(setReport).catch(() => setReport(null));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Booking trends, revenue & occupancy</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Total Bookings</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">
            {report ? report.total_bookings : '—'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Occupancy Rate</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">
            {report ? `${(report.occupancy_rate * 100).toFixed(1)}%` : '—'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Estimated Revenue</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">
            {report ? report.estimated_revenue : '—'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Rooms Count</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">
            {report ? report.rooms_count : '—'}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
