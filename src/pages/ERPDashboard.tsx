import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ERPSidebar } from '@/components/erp/ERPSidebar';
import { DashboardModule } from '@/components/erp/DashboardModule';
import { BookingsModule } from '@/components/erp/BookingsModule';
import { RoomsModule } from '@/components/erp/RoomsModule';
import { CheckInOutModule } from '@/components/erp/CheckInOutModule';
import { HousekeepingModule } from '@/components/erp/HousekeepingModule';
import { StaffModule } from '@/components/erp/StaffModule';
import { AnalyticsModule } from '@/components/erp/AnalyticsModule';
import { SettingsModule } from '@/components/erp/SettingsModule';
import { getERPUser, clearERPAuth, hasAccess, ERPUser, getERPToken, setERPAuth, getEffectiveRole, setERPViewAsRole, getERPViewAsRole, getRoleModules } from '@/lib/erp-auth';
import { erpMe } from '@/lib/erp-api';
import { Loader2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLE_OPTIONS } from '@/lib/erp-constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ERPDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<ERPUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewAsRole, setViewAsRole] = useState<string | null>(getERPViewAsRole());

  useEffect(() => {
    const u = getERPUser();
    const token = getERPToken();
    if (!u || !token) {
      navigate('/erp/login');
      return;
    }
    setUser(u);
    setLoading(false);
    erpMe(token).then(me => {
      setUser(me);
      setERPAuth(token, me);
    }).catch(() => {
      clearERPAuth();
      navigate('/erp/login');
    });
  }, [navigate]);

  const handleSignOut = () => {
    clearERPAuth();
    toast({ title: 'Signed out' });
    navigate('/erp/login');
  };

  const handleModuleChange = (module: string) => {
    const effectiveRole = user ? getEffectiveRole(user) : "";
    if (user && !hasAccess(effectiveRole, module)) {
      toast({ title: 'Access denied', description: 'You don\'t have permission for this module', variant: 'destructive' });
      return;
    }
    setActiveModule(module);
    setSidebarOpen(false);
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <DashboardModule />;
      case 'bookings': return <BookingsModule />;
      case 'rooms': return <RoomsModule />;
      case 'check-in': return <CheckInOutModule />;
      case 'housekeeping': return <HousekeepingModule />;
      case 'staff': return <StaffModule />;
      case 'analytics': return <AnalyticsModule />;
      case 'settings': return <SettingsModule user={user} />;
      default: return <DashboardModule />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <ERPSidebar user={user} effectiveRole={getEffectiveRole(user)} activeModule={activeModule} onModuleChange={handleModuleChange} onSignOut={handleSignOut} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-serif font-bold text-gold">Hotel ERP</h1>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {user.role === 'admin' && (
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <div className="text-xs text-muted-foreground">View as role</div>
              <Select
                value={viewAsRole || "admin"}
                onValueChange={(value) => {
                  const role = value === "admin" ? null : value;
                  setViewAsRole(role);
                  setERPViewAsRole(role);
                  if (role && !hasAccess(role, activeModule)) {
                    setActiveModule('dashboard');
                  }
                }}
              >
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Admin (full access)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (full access)</SelectItem>
                  {ROLE_OPTIONS.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {user.role === 'admin' && viewAsRole && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-base">Role Preview</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="text-muted-foreground mb-2">
                  {`Modules visible to ${ROLE_OPTIONS.find(r => r.value === viewAsRole)?.label || viewAsRole}`}
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {getRoleModules(viewAsRole).map(m => (
                    <li key={m} className="capitalize">{m.replace("-", " ")}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default ERPDashboard;
