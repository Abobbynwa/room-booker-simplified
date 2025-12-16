export type RoomFeature = 'AC' | 'TV' | 'Balcony' | 'Sea View' | 'King Bed' | 'Twin Beds' | 'Mini Fridge' | 'WiFi' | 'Bathtub' | 'Room Service';

export type RoomType = 'Standard' | 'Deluxe' | 'Executive' | 'Suite' | 'Presidential';

export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  price: number;
  features: RoomFeature[];
  description: string;
  image: string;
  isAvailable: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'checked-in' | 'checked-out';

export interface Booking {
  id: string;
  referenceNumber: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: BookingStatus;
  paymentProof?: string;
  createdAt: string;
}

export interface PaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}
