const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export type ERPLoginResponse = {
  access_token: string;
  user: { email: string; role: string; name: string };
};

async function api<T>(path: string, token?: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

export function erpLogin(email: string, password: string) {
  return api<ERPLoginResponse>("/api/erp/login", undefined, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function erpStaffLogin(role: string, password: string) {
  return api<ERPLoginResponse>("/api/erp/login", undefined, {
    method: "POST",
    body: JSON.stringify({ role, password }),
  });
}

export function erpMe(token: string) {
  return api<{ email: string; role: string; name: string }>("/api/erp/me", token);
}

export function erpListStaff(token: string) {
  return api<any[]>("/api/erp/staff", token);
}

export function erpCreateStaff(token: string, payload: any) {
  return api("/api/erp/staff", token, { method: "POST", body: JSON.stringify(payload) });
}

export function erpUpdateStaff(token: string, id: number, payload: any) {
  return api(`/api/erp/staff/${id}`, token, { method: "PUT", body: JSON.stringify(payload) });
}

export function erpDeleteStaff(token: string, id: number) {
  return api(`/api/erp/staff/${id}`, token, { method: "DELETE" });
}

export function erpResetStaffCode(token: string, id: number) {
  return api(`/api/erp/staff/${id}/reset-code`, token, { method: "POST" });
}

export function erpListGuests(token: string) {
  return api<any[]>("/api/erp/guests", token);
}

export function erpCreateGuest(token: string, payload: any) {
  return api("/api/erp/guests", token, { method: "POST", body: JSON.stringify(payload) });
}

export function erpUpdateGuest(token: string, id: number, payload: any) {
  return api(`/api/erp/guests/${id}`, token, { method: "PUT", body: JSON.stringify(payload) });
}

export function erpDeleteGuest(token: string, id: number) {
  return api(`/api/erp/guests/${id}`, token, { method: "DELETE" });
}

export function erpAddReceipt(token: string, guestId: number, payload: any) {
  return api(`/api/erp/guests/${guestId}/receipts`, token, { method: "POST", body: JSON.stringify(payload) });
}

export function erpListReceipts(token: string, guestId: number) {
  return api<any[]>(`/api/erp/guests/${guestId}/receipts`, token);
}

export function erpDeleteReceipt(token: string, guestId: number, receiptId: number) {
  return api(`/api/erp/guests/${guestId}/receipts/${receiptId}`, token, { method: "DELETE" });
}

export function erpListCheckins(token: string) {
  return api<any[]>("/api/erp/checkins", token);
}

export function erpCreateCheckin(token: string, payload: any) {
  return api("/api/erp/checkins", token, { method: "POST", body: JSON.stringify(payload) });
}

export function erpUpdateCheckin(token: string, id: number, payload: any) {
  return api(`/api/erp/checkins/${id}`, token, { method: "PUT", body: JSON.stringify(payload) });
}

export function erpListHousekeeping(token: string) {
  return api<any[]>("/api/erp/housekeeping", token);
}

export function erpCreateHousekeeping(token: string, payload: any) {
  return api("/api/erp/housekeeping", token, { method: "POST", body: JSON.stringify(payload) });
}

export function erpUpdateHousekeeping(token: string, id: number, payload: any) {
  return api(`/api/erp/housekeeping/${id}`, token, { method: "PUT", body: JSON.stringify(payload) });
}

export function erpDeleteHousekeeping(token: string, id: number) {
  return api(`/api/erp/housekeeping/${id}`, token, { method: "DELETE" });
}

export function erpListFloorplan(token: string) {
  return api<any[]>("/api/erp/floorplan", token);
}

export function erpCreateFloorplan(token: string, payload: any) {
  return api("/api/erp/floorplan", token, { method: "POST", body: JSON.stringify(payload) });
}

export function erpUpdateFloorplan(token: string, id: number, payload: any) {
  return api(`/api/erp/floorplan/${id}`, token, { method: "PUT", body: JSON.stringify(payload) });
}

export function erpDeleteFloorplan(token: string, id: number) {
  return api(`/api/erp/floorplan/${id}`, token, { method: "DELETE" });
}

export function erpListBookings(token: string) {
  return api<any[]>("/api/erp/bookings", token);
}

export function erpUpdateBookingStatus(token: string, bookingId: number, payload: any) {
  return api(`/api/erp/bookings/${bookingId}/status`, token, { method: "POST", body: JSON.stringify(payload) });
}

export function erpUpdatePaymentProof(token: string, bookingId: number, payload: any) {
  return api(`/api/erp/bookings/${bookingId}/payment-proof`, token, { method: "POST", body: JSON.stringify(payload) });
}

export function erpListRooms(token: string) {
  return api<any[]>("/api/erp/rooms", token);
}

export function erpUpdateRoom(token: string, roomId: number, payload: any) {
  return api(`/api/erp/rooms/${roomId}`, token, { method: "PUT", body: JSON.stringify(payload) });
}

export function erpReportSummary(token: string) {
  return api<any>("/api/erp/reports/summary", token);
}

export function erpListPaymentAccounts(token: string) {
  return api<any[]>("/api/erp/payment-accounts", token);
}

export function erpListStaffDocuments(token: string, staffId: number) {
  return api<any[]>(`/api/erp/staff/${staffId}/documents`, token);
}

export function erpAddStaffDocument(token: string, staffId: number, payload: any) {
  return api(`/api/erp/staff/${staffId}/documents`, token, { method: "POST", body: JSON.stringify(payload) });
}

export function erpDeleteStaffDocument(token: string, staffId: number, docId: number) {
  return api(`/api/erp/staff/${staffId}/documents/${docId}`, token, { method: "DELETE" });
}
