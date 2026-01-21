// Frontend-only API using localStorage
import { Room, Booking, BookingStatus, PaymentStatus } from '@/types/hotel';
import {
  getRooms,
  getRoomById,
  updateRoomAvailability as updateRoom,
  getBookings,
  getBookingByReference,
  createBooking as createNewBooking,
  updateBookingStatus as updateStatus,
  deleteBooking as removeBooking,
  savePaymentProof,
  getPaymentProof,
  paymentDetails as payments,
  contactInfo as contact,
} from './mockData';

// Re-export static data
export const paymentDetails = payments;
export const contactInfo = contact;

// Room API
export async function fetchRooms(): Promise<Room[]> {
  // Simulate async behavior
  await new Promise(resolve => setTimeout(resolve, 100));
  return getRooms();
}

export async function fetchRoomById(id: string): Promise<Room | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return getRoomById(id);
}

export async function updateRoomAvailability(id: string, isAvailable: boolean): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50));
  updateRoom(id, isAvailable);
}

// Booking API
export async function createBooking(booking: {
  room_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  payment_method?: string;
  special_requests?: string;
}): Promise<Booking> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return createNewBooking(booking);
}

export async function fetchBookingByReference(reference: string): Promise<Booking | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return getBookingByReference(reference);
}

export async function fetchAllBookings(): Promise<Booking[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return getBookings();
}

export async function updateBookingStatus(
  id: string,
  bookingStatus: BookingStatus,
  paymentStatus?: PaymentStatus,
  _bookingDetails?: {
    guest_name: string;
    guest_email: string;
    reference_number: string;
    check_in_date: string;
    check_out_date: string;
    room_name?: string;
    total_amount: number;
  }
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50));
  updateStatus(id, bookingStatus, paymentStatus);
}

export async function deleteBooking(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50));
  removeBooking(id);
}

// Upload payment proof
export async function uploadPaymentProof(referenceNumber: string, file: File): Promise<string> {
  return savePaymentProof(referenceNumber, file);
}

// Get payment proof URL for admin viewing
export async function getPaymentProofUrl(filePath: string): Promise<string | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return getPaymentProof(filePath);
}
