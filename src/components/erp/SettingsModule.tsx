import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ERPUser } from '@/lib/erpData';
import { paymentDetails, contactInfo } from '@/lib/mockData';

export function SettingsModule({ user }: { user: ERPUser }) {
  const { toast } = useToast();

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

        <Card>
          <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm"><span className="text-muted-foreground">Email:</span> {contactInfo.email}</p>
            <p className="text-sm"><span className="text-muted-foreground">WhatsApp:</span> {contactInfo.whatsapp}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Payment Accounts</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {paymentDetails.map((p, i) => (
                <div key={i} className="bg-accent/30 rounded-lg p-3 space-y-1">
                  <p className="font-semibold text-gold text-sm">{p.bankName}</p>
                  <p className="text-xs text-muted-foreground">{p.accountName}</p>
                  <p className="text-sm font-mono">{p.accountNumber}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Login Credentials</CardTitle></CardHeader>
          <CardContent>
            <div className="bg-accent/30 rounded-lg p-4 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Admin:</span> admin@hotel.com / admin123</p>
              <p><span className="text-muted-foreground">Employee:</span> employee@hotel.com / employee123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
