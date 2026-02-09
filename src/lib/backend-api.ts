/**
 * Backend API integration for Room Booker
 * Connects frontend to FastAPI backend at http://localhost:8000
 * 
 * For production, update BACKEND_URL to your deployed backend URL
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

interface BookingPayload {
  name: string;
  email: string;
  room_type: string;
  check_in: string;
  check_out: string;
  payment_proof?: string | null;
}

interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

interface AdminLoginPayload {
  email: string;
  password: string;
}

interface AdminLoginResponse {
  access_token: string;
  token_type: string;
}

interface AdminChangePasswordPayload {
  current_password: string;
  new_password: string;
}

interface RoomPayload {
  name: string;
  room_type: string;
  price: number;
  capacity: number;
  amenities?: string | null;
  image_url?: string | null;
  is_available?: boolean;
}

interface PaymentAccountPayload {
  label: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  instructions?: string | null;
}

export async function fetchPublicAnnouncements(): Promise<any[]> {
  const response = await fetch(`${BACKEND_URL}/api/public/announcements`);
  if (!response.ok) return [];
  return response.json();
}

/**
 * Submit a booking via the FastAPI backend
 */
export async function submitBooking(booking: BookingPayload): Promise<{ message: string }> {
  const response = await fetch(`${BACKEND_URL}/api/booking/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Booking submission failed');
  }

  return response.json();
}

/**
 * Submit a contact form via the FastAPI backend
 */
export async function submitContact(contact: ContactPayload): Promise<{ message: string }> {
  const response = await fetch(`${BACKEND_URL}/api/contact/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contact),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Contact submission failed');
  }

  return response.json();
}

/**
 * Admin login via FastAPI backend
 */
export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Invalid credentials' }));
    throw new Error(error.detail || 'Login failed');
  }

  return response.json();
}

/**
 * Fetch admin bookings (requires authentication)
 */
export async function fetchAdminBookings(token: string): Promise<any[]> {
  const response = await fetch(`${BACKEND_URL}/api/admin/bookings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }

  return response.json();
}

/**
 * Fetch admin contact messages (requires authentication)
 */
export async function fetchAdminMessages(token: string): Promise<any[]> {
  const response = await fetch(`${BACKEND_URL}/api/admin/messages`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  return response.json();
}

/**
 * Change admin password (requires authentication)
 */
export async function changeAdminPassword(
  token: string,
  payload: AdminChangePasswordPayload
): Promise<{ message: string }> {
  const response = await fetch(`${BACKEND_URL}/api/admin/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Password update failed' }));
    throw new Error(error.detail || 'Password update failed');
  }

  return response.json();
}

export async function updateAdminBookingStatus(
  token: string,
  bookingId: number,
  payload: { status: string; payment_status?: string }
): Promise<{ message: string }> {
  const response = await fetch(`${BACKEND_URL}/api/admin/bookings/${bookingId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Update failed' }));
    throw new Error(error.detail || 'Update failed');
  }

  return response.json();
}

export async function fetchAdminRooms(token: string): Promise<any[]> {
  const response = await fetch(`${BACKEND_URL}/api/admin/rooms`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch rooms');
  return response.json();
}

export async function createAdminRoom(token: string, payload: RoomPayload): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/admin/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to create room');
  return response.json();
}

export async function updateAdminRoom(token: string, id: number, payload: Partial<RoomPayload>): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/admin/rooms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to update room');
  return response.json();
}

export async function deleteAdminRoom(token: string, id: number): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/admin/rooms/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete room');
}

export async function fetchPaymentAccounts(token: string): Promise<any[]> {
  const response = await fetch(`${BACKEND_URL}/api/admin/payment-accounts`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch payment accounts');
  return response.json();
}

export async function createPaymentAccount(token: string, payload: PaymentAccountPayload): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/admin/payment-accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to create payment account');
  return response.json();
}

export async function updatePaymentAccount(token: string, id: number, payload: Partial<PaymentAccountPayload>): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/admin/payment-accounts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to update payment account');
  return response.json();
}

export async function deletePaymentAccount(token: string, id: number): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/admin/payment-accounts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete payment account');
}

export async function updateBookingStatus(
  token: string,
  bookingId: number,
  status: string,
  payment_status?: string
): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/admin/bookings/${bookingId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status, payment_status }),
  });
  if (!response.ok) throw new Error('Failed to update booking status');
}

export async function updatePaymentProof(
  token: string,
  bookingId: number,
  payment_proof: string
): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/admin/bookings/${bookingId}/payment-proof`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ payment_proof }),
  });
  if (!response.ok) throw new Error('Failed to update payment proof');
}

export async function fetchStaff(token: string): Promise<any[]> {
  const response = await fetch(`${BACKEND_URL}/api/admin/staff`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch staff');
  return response.json();
}

export async function createStaff(token: string, payload: any): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/admin/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to create staff');
  return response.json();
}

export async function updateStaff(token: string, id: number, payload: any): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/admin/staff/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to update staff');
  return response.json();
}

export async function deleteStaff(token: string, id: number): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/admin/staff/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete staff');
}

export async function fetchReportSummary(token: string): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/admin/reports/summary`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch reports');
  return response.json();
}
