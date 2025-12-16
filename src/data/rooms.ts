import { Room, RoomFeature, RoomType } from '@/types/hotel';

const roomTypes: { type: RoomType; basePrice: number; description: string }[] = [
  { type: 'Standard', basePrice: 25000, description: 'Comfortable and cozy room with essential amenities for a pleasant stay.' },
  { type: 'Deluxe', basePrice: 45000, description: 'Spacious room with premium amenities and elegant décor.' },
  { type: 'Executive', basePrice: 75000, description: 'Luxurious room designed for business travelers with executive facilities.' },
  { type: 'Suite', basePrice: 120000, description: 'Expansive suite with separate living area and premium luxury amenities.' },
  { type: 'Presidential', basePrice: 250000, description: 'The pinnacle of luxury with panoramic views and exclusive services.' },
];

const allFeatures: RoomFeature[] = ['AC', 'TV', 'Balcony', 'Sea View', 'King Bed', 'Twin Beds', 'Mini Fridge', 'WiFi', 'Bathtub', 'Room Service'];

const images = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
];

function getRandomFeatures(type: RoomType): RoomFeature[] {
  const baseFeatures: RoomFeature[] = ['AC', 'TV', 'WiFi'];
  
  const typeFeatures: Record<RoomType, RoomFeature[]> = {
    'Standard': ['Mini Fridge'],
    'Deluxe': ['Mini Fridge', 'Balcony', 'King Bed'],
    'Executive': ['Mini Fridge', 'Balcony', 'King Bed', 'Room Service', 'Bathtub'],
    'Suite': ['Mini Fridge', 'Balcony', 'King Bed', 'Room Service', 'Bathtub', 'Sea View'],
    'Presidential': ['Mini Fridge', 'Balcony', 'King Bed', 'Room Service', 'Bathtub', 'Sea View'],
  };

  return [...new Set([...baseFeatures, ...typeFeatures[type]])];
}

export function generateRooms(): Room[] {
  const rooms: Room[] = [];
  
  // Distribution: 60 Standard, 40 Deluxe, 30 Executive, 15 Suite, 5 Presidential
  const distribution: { type: RoomType; count: number }[] = [
    { type: 'Standard', count: 60 },
    { type: 'Deluxe', count: 40 },
    { type: 'Executive', count: 30 },
    { type: 'Suite', count: 15 },
    { type: 'Presidential', count: 5 },
  ];

  let roomCounter = 1;

  distribution.forEach(({ type, count }) => {
    const roomInfo = roomTypes.find(r => r.type === type)!;
    
    for (let i = 0; i < count; i++) {
      const floor = Math.floor(roomCounter / 20) + 1;
      const roomNum = roomCounter % 20 || 20;
      
      rooms.push({
        id: `room-${roomCounter}`,
        roomNumber: `${floor}${roomNum.toString().padStart(2, '0')}`,
        type,
        price: roomInfo.basePrice + (Math.floor(Math.random() * 5) * 5000),
        features: getRandomFeatures(type),
        description: roomInfo.description,
        image: images[Math.floor(Math.random() * images.length)],
        isAvailable: Math.random() > 0.2, // 80% available
      });
      
      roomCounter++;
    }
  });

  return rooms;
}

export const rooms = generateRooms();

export const paymentDetails = [
  { bankName: 'OPay', accountName: 'AGABA VALENTINE', accountNumber: '+2348149642220' },
  { bankName: 'Moniepoint', accountName: 'AGABA VALENTINE', accountNumber: '1958811611' },
  { bankName: 'Access Bank', accountName: 'AGABA VALENTINE', accountNumber: '1958811611' },
];

export const contactInfo = {
  email: 'abobbynwa@proton.me',
  phone: '+2348149642220',
  whatsapp: '+2348149642220',
};
