export type ERPUser = {
  email: string;
  role: string;
  name: string;
};

const ERP_TOKEN_KEY = "erp_token";
const ERP_USER_KEY = "erp_user";

export function setERPAuth(token: string, user: ERPUser) {
  localStorage.setItem(ERP_TOKEN_KEY, token);
  localStorage.setItem(ERP_USER_KEY, JSON.stringify(user));
}

export function getERPToken(): string | null {
  return localStorage.getItem(ERP_TOKEN_KEY);
}

export function getERPUser(): ERPUser | null {
  const stored = localStorage.getItem(ERP_USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function clearERPAuth() {
  localStorage.removeItem(ERP_TOKEN_KEY);
  localStorage.removeItem(ERP_USER_KEY);
}

const ROLE_ACCESS: Record<string, string[]> = {
  admin: ["dashboard", "bookings", "rooms", "check-in", "housekeeping", "staff", "analytics", "settings"],
  manager: ["dashboard", "bookings", "rooms", "check-in", "housekeeping", "staff", "analytics", "settings"],
  assistant_manager: ["dashboard", "bookings", "rooms", "check-in", "housekeeping", "staff", "analytics", "settings"],
  receptionist: ["dashboard", "bookings", "check-in", "rooms"],
  concierge: ["dashboard", "bookings", "check-in", "rooms"],
  accountant: ["dashboard", "bookings", "analytics", "settings"],
  cashier: ["dashboard", "bookings", "analytics", "settings"],
  housekeeping: ["dashboard", "housekeeping", "rooms"],
  laundry: ["dashboard", "housekeeping", "rooms"],
  maintenance: ["dashboard", "rooms"],
  security: ["dashboard", "rooms", "check-in"],
  bar_attendant: ["dashboard", "bookings"],
  storekeeper: ["dashboard", "rooms"],
  chef: ["dashboard", "bookings"],
  kitchen_staff: ["dashboard", "bookings"],
  restaurant_waiter: ["dashboard", "bookings"],
  room_service: ["dashboard", "bookings"],
  events_banquets: ["dashboard", "bookings"],
  it_support: ["dashboard", "rooms"],
  hr_officer: ["dashboard", "staff"],
  sales_marketing: ["dashboard", "bookings", "analytics"],
};

export function hasAccess(role: string, module: string): boolean {
  const key = role?.toLowerCase() || "";
  return ROLE_ACCESS[key]?.includes(module) ?? false;
}
