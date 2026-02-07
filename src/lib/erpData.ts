import { Booking } from '@/types/hotel';
import { getBookings, getRooms } from './mockData';

// ==================== TYPES ====================

export type UserRole = 'admin' | 'employee';

export interface ERPUser {
  email: string;
  role: UserRole;
  name: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'active' | 'inactive' | 'on_leave';
  salary: number;
  hired_at: string;
}

export interface CheckInRecord {
  id: string;
  booking_id: string;
  guest_name: string;
  room_id: string;
  room_number: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  status: 'expected' | 'checked_in' | 'checked_out' | 'no_show';
  notes: string;
}

export interface HousekeepingTask {
  id: string;
  room_id: string;
  room_number: string;
  type: 'cleaning' | 'maintenance' | 'inspection' | 'turnover';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string;
  description: string;
  created_at: string;
  completed_at: string | null;
}

// ==================== CREDENTIALS ====================

const CREDENTIALS: Record<string, { password: string; role: UserRole; name: string }> = {
  'admin@hotel.com': { password: 'admin123', role: 'admin', name: 'Admin Manager' },
  'employee@hotel.com': { password: 'employee123', role: 'employee', name: 'Front Desk Staff' },
};

// ==================== AUTH ====================

const ERP_USER_KEY = 'erp_user';

export function erpSignIn(email: string, password: string): { success: boolean; user?: ERPUser; error?: string } {
  const cred = CREDENTIALS[email];
  if (!cred || cred.password !== password) {
    return { success: false, error: 'Invalid email or password' };
  }
  const user: ERPUser = { email, role: cred.role, name: cred.name };
  localStorage.setItem(ERP_USER_KEY, JSON.stringify(user));
  return { success: true, user };
}

export function getERPUser(): ERPUser | null {
  const stored = localStorage.getItem(ERP_USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function erpSignOut(): void {
  localStorage.removeItem(ERP_USER_KEY);
}

// Role-based access
export const ROLE_ACCESS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'bookings', 'rooms', 'check-in', 'housekeeping', 'staff', 'analytics', 'settings'],
  employee: ['dashboard', 'bookings', 'check-in', 'housekeeping', 'rooms'],
};

export function hasAccess(role: UserRole, module: string): boolean {
  return ROLE_ACCESS[role]?.includes(module) ?? false;
}

// ==================== STAFF MANAGEMENT ====================

const STAFF_KEY = 'erp_staff';

function initStaff(): StaffMember[] {
  const stored = localStorage.getItem(STAFF_KEY);
  if (stored) return JSON.parse(stored);
  
  const defaults: StaffMember[] = [
    { id: 'staff-1', name: 'Adebayo Johnson', email: 'adebayo@hotel.com', phone: '+2348012345678', role: 'Front Desk', department: 'Reception', shift: 'morning', status: 'active', salary: 150000, hired_at: '2024-01-15' },
    { id: 'staff-2', name: 'Chioma Okafor', email: 'chioma@hotel.com', phone: '+2348023456789', role: 'Housekeeper', department: 'Housekeeping', shift: 'morning', status: 'active', salary: 100000, hired_at: '2024-03-01' },
    { id: 'staff-3', name: 'Emmanuel Nwachukwu', email: 'emmanuel@hotel.com', phone: '+2348034567890', role: 'Manager', department: 'Management', shift: 'morning', status: 'active', salary: 300000, hired_at: '2023-06-10' },
    { id: 'staff-4', name: 'Fatima Ibrahim', email: 'fatima@hotel.com', phone: '+2348045678901', role: 'Front Desk', department: 'Reception', shift: 'afternoon', status: 'active', salary: 150000, hired_at: '2024-05-20' },
    { id: 'staff-5', name: 'Grace Akinola', email: 'grace@hotel.com', phone: '+2348056789012', role: 'Housekeeper', department: 'Housekeeping', shift: 'afternoon', status: 'on_leave', salary: 100000, hired_at: '2024-02-14' },
    { id: 'staff-6', name: 'Hassan Musa', email: 'hassan@hotel.com', phone: '+2348067890123', role: 'Security', department: 'Security', shift: 'night', status: 'active', salary: 120000, hired_at: '2023-11-01' },
  ];
  localStorage.setItem(STAFF_KEY, JSON.stringify(defaults));
  return defaults;
}

export function getStaff(): StaffMember[] { return initStaff(); }

export function createStaff(data: Omit<StaffMember, 'id'>): StaffMember {
  const staff = getStaff();
  const newStaff: StaffMember = { ...data, id: `staff-${Date.now()}` };
  staff.push(newStaff);
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
  return newStaff;
}

export function updateStaff(id: string, data: Partial<StaffMember>): void {
  const staff = getStaff();
  const idx = staff.findIndex(s => s.id === id);
  if (idx !== -1) {
    staff[idx] = { ...staff[idx], ...data };
    localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
  }
}

export function deleteStaff(id: string): void {
  const staff = getStaff().filter(s => s.id !== id);
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
}

// ==================== CHECK-IN/OUT ====================

const CHECKIN_KEY = 'erp_checkins';

export function getCheckInRecords(): CheckInRecord[] {
  const stored = localStorage.getItem(CHECKIN_KEY);
  if (stored) return JSON.parse(stored);
  
  // Generate from current bookings
  const bookings = getBookings();
  const rooms = getRooms();
  const records: CheckInRecord[] = bookings.slice(0, 20).map(b => {
    const room = rooms.find(r => r.id === b.room_id);
    return {
      id: `checkin-${b.id}`,
      booking_id: b.id,
      guest_name: b.guest_name,
      room_id: b.room_id,
      room_number: room?.room_number || 'N/A',
      checked_in_at: b.booking_status === 'confirmed' ? b.check_in_date : null,
      checked_out_at: b.booking_status === 'completed' ? b.check_out_date : null,
      status: b.booking_status === 'completed' ? 'checked_out' : b.booking_status === 'confirmed' ? 'checked_in' : 'expected',
      notes: '',
    };
  });
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(records));
  return records;
}

export function updateCheckIn(id: string, data: Partial<CheckInRecord>): void {
  const records = getCheckInRecords();
  const idx = records.findIndex(r => r.id === id);
  if (idx !== -1) {
    records[idx] = { ...records[idx], ...data };
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(records));
  }
}

export function checkInGuest(id: string): void {
  updateCheckIn(id, { status: 'checked_in', checked_in_at: new Date().toISOString() });
}

export function checkOutGuest(id: string): void {
  updateCheckIn(id, { status: 'checked_out', checked_out_at: new Date().toISOString() });
}

export function reassignRoom(checkInId: string, newRoomId: string, newRoomNumber: string): void {
  updateCheckIn(checkInId, { room_id: newRoomId, room_number: newRoomNumber });
}

// ==================== HOUSEKEEPING ====================

const HOUSEKEEPING_KEY = 'erp_housekeeping';

function initHousekeeping(): HousekeepingTask[] {
  const stored = localStorage.getItem(HOUSEKEEPING_KEY);
  if (stored) return JSON.parse(stored);
  
  const rooms = getRooms().slice(0, 15);
  const staff = getStaff().filter(s => s.department === 'Housekeeping');
  const types: HousekeepingTask['type'][] = ['cleaning', 'maintenance', 'inspection', 'turnover'];
  const priorities: HousekeepingTask['priority'][] = ['low', 'medium', 'high', 'urgent'];
  
  const tasks: HousekeepingTask[] = rooms.map((room, i) => ({
    id: `hk-${room.id}`,
    room_id: room.id,
    room_number: room.room_number,
    type: types[i % types.length],
    status: i < 5 ? 'pending' : i < 10 ? 'in_progress' : 'completed',
    priority: priorities[i % priorities.length],
    assigned_to: staff.length > 0 ? staff[i % staff.length].name : 'Unassigned',
    description: `${types[i % types.length]} needed for room ${room.room_number}`,
    created_at: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
    completed_at: i >= 10 ? new Date().toISOString() : null,
  }));
  
  localStorage.setItem(HOUSEKEEPING_KEY, JSON.stringify(tasks));
  return tasks;
}

export function getHousekeepingTasks(): HousekeepingTask[] { return initHousekeeping(); }

export function createHousekeepingTask(data: Omit<HousekeepingTask, 'id' | 'created_at' | 'completed_at'>): HousekeepingTask {
  const tasks = getHousekeepingTasks();
  const task: HousekeepingTask = { ...data, id: `hk-${Date.now()}`, created_at: new Date().toISOString(), completed_at: null };
  tasks.unshift(task);
  localStorage.setItem(HOUSEKEEPING_KEY, JSON.stringify(tasks));
  return task;
}

export function updateHousekeepingTask(id: string, data: Partial<HousekeepingTask>): void {
  const tasks = getHousekeepingTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...data };
    if (data.status === 'completed') tasks[idx].completed_at = new Date().toISOString();
    localStorage.setItem(HOUSEKEEPING_KEY, JSON.stringify(tasks));
  }
}

export function deleteHousekeepingTask(id: string): void {
  const tasks = getHousekeepingTasks().filter(t => t.id !== id);
  localStorage.setItem(HOUSEKEEPING_KEY, JSON.stringify(tasks));
}

// ==================== ANALYTICS ====================

export function getAnalyticsData() {
  const bookings = getBookings();
  const rooms = getRooms();
  
  const totalRevenue = bookings.filter(b => b.payment_status === 'confirmed').reduce((sum, b) => sum + b.total_amount, 0);
  const totalBookings = bookings.length;
  const occupiedRooms = rooms.filter(r => !r.is_available).length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
  
  // Monthly revenue (last 6 months)
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.toLocaleString('default', { month: 'short' });
    const monthBookings = bookings.filter(b => {
      const bd = new Date(b.created_at);
      return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
    });
    return {
      month,
      revenue: monthBookings.reduce((sum, b) => sum + b.total_amount, 0),
      bookings: monthBookings.length,
    };
  });
  
  // Room type distribution
  const roomTypeData = (['standard', 'deluxe', 'executive', 'suite', 'presidential'] as const).map(type => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count: rooms.filter(r => r.type === type).length,
    occupied: rooms.filter(r => r.type === type && !r.is_available).length,
  }));
  
  // Booking status breakdown
  const statusData = (['pending', 'confirmed', 'cancelled', 'completed'] as const).map(status => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count: bookings.filter(b => b.booking_status === status).length,
  }));
  
  return { totalRevenue, totalBookings, occupiedRooms, totalRooms: rooms.length, occupancyRate, monthlyRevenue, roomTypeData, statusData };
}
