export type RoomFeature = 'AC' | 'TV' | 'Balcony' | 'Sea View' | 'King Bed' | 'Twin Beds' | 'Mini Fridge' | 'WiFi' | 'Bathtub' | 'Room Service' | 'Workspace' | 'Premium Bath' | 'Living Area' | 'Jacuzzi' | 'Private Pool' | 'Butler Service';

export type RoomType = 'standard' | 'deluxe' | 'executive' | 'suite' | 'presidential';

export interface Room {
  id: string;
  room_number: string;
  type: RoomType;
  name: string;
  description: string | null;
  price_per_night: number;
  capacity: number;
  features: string[];
  image_url: string | null;
  is_available: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type PaymentStatus = 'pending' | 'confirmed';

export interface Booking {
  id: string;
  reference_number: string;
  room_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  special_requests: string | null;
  payment_proof_url: string | null;
  created_at: string;
}

export interface PaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}