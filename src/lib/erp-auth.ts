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
  receptionist: ["dashboard", "bookings", "check-in", "rooms"],
  accountant: ["dashboard", "bookings", "analytics", "settings"],
  housekeeping: ["dashboard", "housekeeping", "rooms"],
  security: ["dashboard", "rooms", "check-in"],
  bar: ["dashboard", "bookings"],
};

export function hasAccess(role: string, module: string): boolean {
  return ROLE_ACCESS[role]?.includes(module) ?? false;
}
