import { Booking, BookingStatus } from '@/types/hotel';

const BOOKINGS_KEY = 'hotel_bookings';
const ROOMS_KEY = 'hotel_rooms_availability';

export function generateReferenceNumber(): string {
  const prefix = 'LUX';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function getBookings(): Booking[] {
  const data = localStorage.getItem(BOOKINGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveBooking(booking: Booking): void {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function updateBookingStatus(referenceNumber: string, status: BookingStatus): Booking | null {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.referenceNumber === referenceNumber);
  
  if (index !== -1) {
    bookings[index].status = status;
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    return bookings[index];
  }
  
  return null;
}

export function getBookingByReference(referenceNumber: string): Booking | null {
  const bookings = getBookings();
  return bookings.find(b => b.referenceNumber === referenceNumber) || null;
}

export function getRoomAvailability(): Record<string, boolean> {
  const data = localStorage.getItem(ROOMS_KEY);
  return data ? JSON.parse(data) : {};
}

export function updateRoomAvailability(roomId: string, isAvailable: boolean): void {
  const availability = getRoomAvailability();
  availability[roomId] = isAvailable;
  localStorage.setItem(ROOMS_KEY, JSON.stringify(availability));
}

export function deleteBooking(referenceNumber: string): boolean {
  const bookings = getBookings();
  const filtered = bookings.filter(b => b.referenceNumber !== referenceNumber);
  
  if (filtered.length !== bookings.length) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(filtered));
    return true;
  }
  
  return false;
}
