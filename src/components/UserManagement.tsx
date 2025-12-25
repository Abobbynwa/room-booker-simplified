import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, Trash2, Loader2, Shield, ShieldCheck, User } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: AppRole | null;
}

const roleConfig: Record<AppRole, { label: string; icon: React.ReactNode; color: string }> = {
  admin: { label: 'Admin', icon: <ShieldCheck className="h-3 w-3" />, color: 'bg-destructive' },
  moderator: { label: 'Moderator', icon: <Shield className="h-3 w-3" />, color: 'bg-yellow-500' },
  user: { label: 'User', icon: <User className="h-3 w-3" />, color: 'bg-muted-foreground' },
};

export function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<AppRole | 'all'>('all');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  const fetchUsers = async () => {
    try {
      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at');

      if (rolesError) throw rolesError;

      // Get unique user data from roles
      const usersWithRoles: UserWithRole[] = (roles || []).map(role => ({
        id: role.user_id,
        email: '', // Will be populated if we have access
        created_at: role.created_at,
        role: role.role,
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });

      if (error) throw error;

      await fetchUsers();
      toast({
        title: 'Role Added',
        description: `User role updated to ${roleConfig[role].label}.`,
      });
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: 'Error',
        description: 'Failed to add role.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveRole = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user\'s role?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      await fetchUsers();
      toast({
        title: 'Role Removed',
        description: 'User role has been removed.',
      });
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove role.',
        variant: 'destructive',
      });
    }
  };

  const handleAddAdminByEmail = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email address.',
        variant: 'destructive',
      });
      return;
    }

    setAddingAdmin(true);
    try {
      // We need to find the user by email - this requires checking if the user exists
      // Since we can't query auth.users directly, we'll inform the user
      toast({
        title: 'Note',
        description: 'To add an admin, the user must first sign up. Then you can find them by their user ID in the roles list.',
      });
      setNewAdminEmail('');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to add admin.',
        variant: 'destructive',
      });
    } finally {
      setAddingAdmin(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Role Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-gold" />
            Add User Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            To assign a role to a user, they must first create an account. Once registered, 
            their user ID will appear in the list below where you can assign roles.
          </p>
          <div className="flex gap-3">
            <Input
              placeholder="Enter user email (for reference)"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddAdminByEmail} disabled={addingAdmin} className="gap-2">
              {addingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <CardTitle className="font-serif">User Roles</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as AppRole | 'all')}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Assigned At</TableHead>
                    <TableHead>Change Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-sm">{user.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        {user.role && (
                          <Badge className={`${roleConfig[user.role].color} text-white gap-1`}>
                            {roleConfig[user.role].icon}
                            {roleConfig[user.role].label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role || undefined}
                          onValueChange={(v) => handleAddRole(user.id, v as AppRole)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRole(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No user roles found.</p>
              <p className="text-sm mt-1">Users will appear here once they sign up and are assigned roles.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
