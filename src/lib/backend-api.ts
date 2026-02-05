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
