import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ERPUser, getERPToken } from '@/lib/erp-auth';
import { erpListPaymentAccounts } from '@/lib/erp-api';

export function SettingsModule({ user }: { user: ERPUser }) {
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const token = getERPToken();
    if (!token) return;
    erpListPaymentAccounts(token).then(setAccounts).catch(() => setAccounts([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Hotel configuration</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Account Info</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm"><span className="text-muted-foreground">Email:</span> {user.email}</p>
            <p className="text-sm"><span className="text-muted-foreground">Role:</span> <span className="capitalize">{user.role}</span></p>
            <p className="text-sm"><span className="text-muted-foreground">Name:</span> {user.name}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Payment Accounts</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {accounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment accounts yet.</p>
              ) : accounts.map((p, i) => (
                <div key={i} className="bg-accent/30 rounded-lg p-3 space-y-1">
                  <p className="font-semibold text-gold text-sm">{p.bank_name}</p>
                  <p className="text-xs text-muted-foreground">{p.account_name}</p>
                  <p className="text-sm font-mono">{p.account_number}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
