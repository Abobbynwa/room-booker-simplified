import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, BedDouble, CalendarCheck, ClipboardList, Home, Settings, Sparkles, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ERPUser, hasAccess } from '@/lib/erp-auth';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ERPSidebarProps {
  user: ERPUser;
  activeModule: string;
  onModuleChange: (module: string) => void;
  onSignOut: () => void;
}

const modules = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'bookings', label: 'Bookings', icon: ClipboardList },
  { id: 'rooms', label: 'Room Status', icon: BedDouble },
  { id: 'check-in', label: 'Check-in/Out', icon: CalendarCheck },
  { id: 'housekeeping', label: 'Housekeeping', icon: Sparkles },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function ERPSidebar({ user, activeModule, onModuleChange, onSignOut }: ERPSidebarProps) {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col min-h-screen">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-serif font-bold text-gold">Hotel ERP</h2>
        <p className="text-xs text-muted-foreground mt-1">{user.name}</p>
        <Badge variant="outline" className="mt-1 text-xs capitalize">
          {user.role}
        </Badge>
      </div>
      
      <nav className="flex-1 p-2 space-y-1">
        {modules.filter(m => hasAccess(user.role, m.id)).map(m => (
          <button
            key={m.id}
            onClick={() => onModuleChange(m.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left",
              activeModule === m.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <m.icon className="h-4 w-4 shrink-0" />
            {m.label}
          </button>
        ))}
      </nav>
      
      <div className="p-3 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={onSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
