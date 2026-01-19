import { supabase } from '@/integrations/supabase/client';
import { Room, Booking, RoomType, BookingStatus, PaymentStatus } from '@/types/hotel';

// Payment details (static)
export const paymentDetails = [
  {
    bankName: 'OPay',
    accountName: 'AGABA VALENTINE',
    accountNumber: '+2348149642220',
  },
  {
    bankName: 'Moniepoint',
    accountName: 'AGABA VALENTINE',
    accountNumber: '1958811611',
  },
  {
    bankName: 'Access Bank',
    accountName: 'AGABA VALENTINE',
    accountNumber: '1958811611',
  },
];

export const contactInfo = {
  email: 'abobbynwa@proton.me',
  whatsapp: '+234814964220',
};

// Room API
export async function fetchRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('room_number');
  
  if (error) throw error;
  
  return (data || []).map(room => ({
    id: room.id,
    room_number: room.room_number,
    type: room.type as RoomType,
    name: room.name,
    description: room.description,
    price_per_night: room.price_per_night,
    capacity: room.capacity,
    features: room.features || [],
    image_url: room.image_url,
    is_available: room.is_available,
  }));
}

export async function fetchRoomById(id: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  if (!data) return null;
  
  return {
    id: data.id,
    room_number: data.room_number,
    type: data.type as RoomType,
    name: data.name,
    description: data.description,
    price_per_night: data.price_per_night,
    capacity: data.capacity,
    features: data.features || [],
    image_url: data.image_url,
    is_available: data.is_available,
  };
}

export async function updateRoomAvailability(id: string, isAvailable: boolean): Promise<void> {
  const { error } = await supabase
    .from('rooms')
    .update({ is_available: isAvailable })
    .eq('id', id);
  
  if (error) throw error;
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
  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      room_id: booking.room_id,
      guest_name: booking.guest_name,
      guest_email: booking.guest_email,
      guest_phone: booking.guest_phone,
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      total_amount: booking.total_amount,
      payment_method: booking.payment_method || null,
      special_requests: booking.special_requests || null,
    }] as any)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    reference_number: data.reference_number,
    room_id: data.room_id,
    guest_name: data.guest_name,
    guest_email: data.guest_email,
    guest_phone: data.guest_phone,
    check_in_date: data.check_in_date,
    check_out_date: data.check_out_date,
    total_amount: data.total_amount,
    booking_status: data.booking_status as BookingStatus,
    payment_status: data.payment_status as PaymentStatus,
    payment_method: data.payment_method,
    special_requests: data.special_requests,
    created_at: data.created_at,
  };
}

export async function fetchBookingByReference(reference: string): Promise<Booking | null> {
  // Use secure RPC function to fetch booking by reference
  // This bypasses RLS securely while only returning the matching booking
  const { data, error } = await supabase.rpc('get_booking_by_reference', {
    ref_number: reference
  });
  
  if (error) throw error;
  if (!data || data.length === 0) return null;
  
  const booking = data[0];
  return {
    id: booking.id,
    reference_number: booking.reference_number,
    room_id: booking.room_id,
    guest_name: booking.guest_name,
    guest_email: booking.guest_email,
    guest_phone: booking.guest_phone,
    check_in_date: booking.check_in_date,
    check_out_date: booking.check_out_date,
    total_amount: booking.total_amount,
    booking_status: booking.booking_status as BookingStatus,
    payment_status: booking.payment_status as PaymentStatus,
    payment_method: booking.payment_method,
    special_requests: booking.special_requests,
    created_at: booking.created_at,
  };
}

export async function fetchAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(b => ({
    id: b.id,
    reference_number: b.reference_number,
    room_id: b.room_id,
    guest_name: b.guest_name,
    guest_email: b.guest_email,
    guest_phone: b.guest_phone,
    check_in_date: b.check_in_date,
    check_out_date: b.check_out_date,
    total_amount: b.total_amount,
    booking_status: b.booking_status as BookingStatus,
    payment_status: b.payment_status as PaymentStatus,
    payment_method: b.payment_method,
    special_requests: b.special_requests,
    created_at: b.created_at,
  }));
}

export async function updateBookingStatus(
  id: string, 
  bookingStatus: BookingStatus,
  paymentStatus?: PaymentStatus,
  bookingDetails?: {
    guest_name: string;
    guest_email: string;
    reference_number: string;
    check_in_date: string;
    check_out_date: string;
    room_name?: string;
    total_amount: number;
  }
): Promise<void> {
  const updates: Record<string, unknown> = { booking_status: bookingStatus };
  if (paymentStatus) {
    updates.payment_status = paymentStatus;
  }
  
  const { error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;

  // Send email notification if booking details are provided
  if (bookingDetails) {
    try {
      await supabase.functions.invoke('send-booking-notification', {
        body: {
          guest_name: bookingDetails.guest_name,
          guest_email: bookingDetails.guest_email,
          reference_number: bookingDetails.reference_number,
          booking_status: bookingStatus,
          payment_status: paymentStatus || 'pending',
          check_in_date: bookingDetails.check_in_date,
          check_out_date: bookingDetails.check_out_date,
          room_name: bookingDetails.room_name,
          total_amount: bookingDetails.total_amount,
        },
      });
    } catch (notificationError) {
      // Log error but don't fail the status update
      console.error('Failed to send booking notification:', notificationError);
    }
  }
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}