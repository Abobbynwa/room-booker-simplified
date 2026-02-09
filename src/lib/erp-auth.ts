export type ERPUser = {
  email: string;
  role: string;
  name: string;
};

const ERP_TOKEN_KEY = "erp_token";
const ERP_USER_KEY = "erp_user";
const ERP_VIEW_AS_ROLE_KEY = "erp_view_as_role";

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
  localStorage.removeItem(ERP_VIEW_AS_ROLE_KEY);
}

const ROLE_ACCESS: Record<string, string[]> = {
  admin: ["dashboard", "bookings", "rooms", "check-in", "housekeeping", "staff", "analytics", "settings", "inventory", "payments"],
  manager: ["dashboard", "bookings", "rooms", "check-in", "housekeeping", "staff", "analytics", "settings", "payments", "inventory"],
  assistant_manager: ["dashboard", "bookings", "rooms", "check-in", "housekeeping", "staff", "analytics", "settings", "payments", "inventory"],
  receptionist: ["dashboard", "bookings", "check-in", "rooms"],
  concierge: ["dashboard", "bookings", "check-in", "rooms"],
  accountant: ["dashboard", "payments", "analytics", "settings"],
  cashier: ["dashboard", "payments", "analytics"],
  housekeeping: ["dashboard", "housekeeping", "rooms"],
  laundry: ["dashboard", "housekeeping", "rooms"],
  maintenance: ["dashboard", "rooms"],
  security: ["dashboard", "rooms", "check-in"],
  bar_attendant: ["dashboard", "inventory"],
  storekeeper: ["dashboard", "inventory"],
  chef: ["dashboard", "inventory"],
  kitchen_staff: ["dashboard", "inventory"],
  restaurant_waiter: ["dashboard", "inventory"],
  room_service: ["dashboard", "inventory"],
  events_banquets: ["dashboard", "bookings", "inventory"],
  it_support: ["dashboard", "rooms"],
  hr_officer: ["dashboard", "staff"],
  sales_marketing: ["dashboard", "bookings", "analytics"],
};

export function hasAccess(role: string, module: string): boolean {
  const key = role?.toLowerCase() || "";
  return ROLE_ACCESS[key]?.includes(module) ?? false;
}

export function getRoleModules(role: string): string[] {
  const key = role?.toLowerCase() || "";
  return ROLE_ACCESS[key] || [];
}

export function setERPViewAsRole(role: string | null) {
  if (!role) {
    localStorage.removeItem(ERP_VIEW_AS_ROLE_KEY);
    return;
  }
  localStorage.setItem(ERP_VIEW_AS_ROLE_KEY, role);
}

export function getERPViewAsRole(): string | null {
  return localStorage.getItem(ERP_VIEW_AS_ROLE_KEY);
}

export function getEffectiveRole(user: ERPUser): string {
  if (user.role !== "admin") return user.role;
  return getERPViewAsRole() || "admin";
}
