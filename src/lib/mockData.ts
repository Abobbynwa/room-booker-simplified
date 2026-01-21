import { Room, Booking, RoomType, RoomFeature } from '@/types/hotel';

// Generate 150 rooms across different types
const roomImages: Record<RoomType, string[]> = {
  standard: [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
  ],
  deluxe: [
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800',
  ],
  executive: [
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
    'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800',
  ],
  suite: [
    'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800',
    'https://images.unsplash.com/photo-1602002418082-dd4a8f7c7e4b?w=800',
    'https://images.unsplash.com/photo-1594563703937-fdc640497dcd?w=800',
  ],
  presidential: [
    'https://images.unsplash.com/photo-1609949279531-cf48d64bed89?w=800',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  ],
};

const featuresByType: Record<RoomType, RoomFeature[]> = {
  standard: ['AC', 'TV', 'WiFi', 'Mini Fridge'],
  deluxe: ['AC', 'TV', 'WiFi', 'Mini Fridge', 'Balcony', 'Room Service'],
  executive: ['AC', 'TV', 'WiFi', 'Mini Fridge', 'Balcony', 'Room Service', 'Workspace', 'Premium Bath'],
  suite: ['AC', 'TV', 'WiFi', 'Mini Fridge', 'Balcony', 'Room Service', 'Workspace', 'Premium Bath', 'Living Area', 'Sea View'],
  presidential: ['AC', 'TV', 'WiFi', 'Mini Fridge', 'Balcony', 'Room Service', 'Workspace', 'Premium Bath', 'Living Area', 'Sea View', 'Jacuzzi', 'Private Pool', 'Butler Service'],
};

const pricesByType: Record<RoomType, number> = {
  standard: 25000,
  deluxe: 45000,
  executive: 75000,
  suite: 120000,
  presidential: 250000,
};

const capacityByType: Record<RoomType, number> = {
  standard: 2,
  deluxe: 2,
  executive: 3,
  suite: 4,
  presidential: 6,
};

const descriptionsByType: Record<RoomType, string> = {
  standard: 'Comfortable and cozy room with all essential amenities for a pleasant stay. Perfect for solo travelers or couples.',
  deluxe: 'Spacious room with premium amenities and beautiful interior design. Enjoy extra comfort with a private balcony.',
  executive: 'Elegant room designed for business travelers with dedicated workspace and premium bath amenities.',
  suite: 'Luxurious suite featuring a separate living area, stunning views, and top-tier amenities for an unforgettable experience.',
  presidential: 'The ultimate luxury experience with private pool, jacuzzi, butler service, and panoramic views of the city.',
};

function generateRooms(): Room[] {
  const rooms: Room[] = [];
  const types: RoomType[] = ['standard', 'deluxe', 'executive', 'suite', 'presidential'];
  const distribution = { standard: 60, deluxe: 40, executive: 25, suite: 15, presidential: 10 };
  
  let roomNumber = 101;
  
  for (const type of types) {
    const count = distribution[type];
    for (let i = 0; i < count; i++) {
      const images = roomImages[type];
      rooms.push({
        id: `room-${roomNumber}`,
        room_number: String(roomNumber),
        type,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Room`,
        description: descriptionsByType[type],
        price_per_night: pricesByType[type],
        capacity: capacityByType[type],
        features: featuresByType[type],
        image_url: images[i % images.length],
        is_available: Math.random() > 0.2, // 80% available
      });
      roomNumber++;
    }
  }
  
  return rooms;
}

export const mockRooms: Room[] = generateRooms();

// LocalStorage keys
const BOOKINGS_KEY = 'hotel_bookings';
const ROOMS_KEY = 'hotel_rooms';
const ADMIN_KEY = 'hotel_admin';
const PAYMENT_PROOFS_KEY = 'hotel_payment_proofs';

// Initialize rooms in localStorage if not exists
export function initializeRooms(): Room[] {
  const stored = localStorage.getItem(ROOMS_KEY);
  if (!stored) {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(mockRooms));
    return mockRooms;
  }
  return JSON.parse(stored);
}

export function getRooms(): Room[] {
  return initializeRooms();
}

export function getRoomById(id: string): Room | null {
  const rooms = getRooms();
  return rooms.find(r => r.id === id) || null;
}

export function updateRoomAvailability(id: string, isAvailable: boolean): void {
  const rooms = getRooms();
  const index = rooms.findIndex(r => r.id === id);
  if (index !== -1) {
    rooms[index].is_available = isAvailable;
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  }
}

// Booking functions
function generateReferenceNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BK';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getBookings(): Booking[] {
  const stored = localStorage.getItem(BOOKINGS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getBookingByReference(reference: string): Booking | null {
  const bookings = getBookings();
  return bookings.find(b => b.reference_number.toLowerCase() === reference.toLowerCase()) || null;
}

export function createBooking(bookingData: {
  room_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  payment_method?: string;
  special_requests?: string;
}): Booking {
  const bookings = getBookings();
  
  const newBooking: Booking = {
    id: `booking-${Date.now()}`,
    reference_number: generateReferenceNumber(),
    room_id: bookingData.room_id,
    guest_name: bookingData.guest_name,
    guest_email: bookingData.guest_email,
    guest_phone: bookingData.guest_phone,
    check_in_date: bookingData.check_in_date,
    check_out_date: bookingData.check_out_date,
    total_amount: bookingData.total_amount,
    booking_status: 'pending',
    payment_status: 'pending',
    payment_method: bookingData.payment_method || null,
    special_requests: bookingData.special_requests || null,
    payment_proof_url: null,
    created_at: new Date().toISOString(),
  };
  
  bookings.unshift(newBooking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  
  // Mark room as unavailable
  updateRoomAvailability(bookingData.room_id, false);
  
  return newBooking;
}

export function updateBookingStatus(
  id: string,
  bookingStatus: Booking['booking_status'],
  paymentStatus?: Booking['payment_status']
): void {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  
  if (index !== -1) {
    bookings[index].booking_status = bookingStatus;
    if (paymentStatus) {
      bookings[index].payment_status = paymentStatus;
    }
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    
    // If cancelled, make room available again
    if (bookingStatus === 'cancelled' || bookingStatus === 'completed') {
      updateRoomAvailability(bookings[index].room_id, true);
    }
  }
}

export function deleteBooking(id: string): void {
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === id);
  
  if (booking) {
    // Make room available again
    updateRoomAvailability(booking.room_id, true);
  }
  
  const filtered = bookings.filter(b => b.id !== id);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(filtered));
}

// Payment proof handling (store as base64 in localStorage)
export function savePaymentProof(referenceNumber: string, file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const proofs = JSON.parse(localStorage.getItem(PAYMENT_PROOFS_KEY) || '{}');
      const proofUrl = reader.result as string;
      proofs[referenceNumber] = proofUrl;
      localStorage.setItem(PAYMENT_PROOFS_KEY, JSON.stringify(proofs));
      
      // Update booking with proof URL reference
      const bookings = getBookings();
      const index = bookings.findIndex(b => b.reference_number === referenceNumber);
      if (index !== -1) {
        bookings[index].payment_proof_url = referenceNumber;
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
      }
      
      resolve(proofUrl);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function getPaymentProof(referenceNumber: string): string | null {
  const proofs = JSON.parse(localStorage.getItem(PAYMENT_PROOFS_KEY) || '{}');
  return proofs[referenceNumber] || null;
}

// Admin authentication (simple localStorage based)
const ADMIN_CREDENTIALS = {
  email: 'admin@hotel.com',
  password: 'admin123',
};

export interface AdminUser {
  email: string;
  isAdmin: boolean;
}

export function getAdminSession(): AdminUser | null {
  const stored = localStorage.getItem(ADMIN_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function adminSignIn(email: string, password: string): { success: boolean; error?: string } {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const admin: AdminUser = { email, isAdmin: true };
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    return { success: true };
  }
  return { success: false, error: 'Invalid email or password' };
}

export function adminSignOut(): void {
  localStorage.removeItem(ADMIN_KEY);
}

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
