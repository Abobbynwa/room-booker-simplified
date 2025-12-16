import { useParams, Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BookingForm } from '@/components/BookingForm';
import { Badge } from '@/components/ui/badge';
import { rooms } from '@/data/rooms';
import { Wifi, Wind, Tv, Coffee, Bath, UtensilsCrossed, Mountain, BedDouble, BedSingle } from 'lucide-react';

const featureIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="h-4 w-4" />,
  'AC': <Wind className="h-4 w-4" />,
  'TV': <Tv className="h-4 w-4" />,
  'Mini Fridge': <Coffee className="h-4 w-4" />,
  'Bathtub': <Bath className="h-4 w-4" />,
  'Room Service': <UtensilsCrossed className="h-4 w-4" />,
  'Sea View': <Mountain className="h-4 w-4" />,
  'Balcony': <Mountain className="h-4 w-4" />,
  'King Bed': <BedDouble className="h-4 w-4" />,
  'Twin Beds': <BedSingle className="h-4 w-4" />,
};

const BookRoom = () => {
  const { roomId } = useParams();
  const room = rooms.find(r => r.id === roomId);

  if (!room) {
    return <Navigate to="/rooms" replace />;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Room Details */}
              <div>
                <div className="sticky top-28">
                  <span className="text-gold uppercase tracking-[0.2em] text-sm font-medium">Book Your Stay</span>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold mt-2 mb-2">
                    {room.type} Room
                  </h1>
                  <p className="text-muted-foreground mb-4">Room {room.roomNumber}</p>
                  
                  <div className="rounded-lg overflow-hidden mb-6">
                    <img
                      src={room.image}
                      alt={`${room.type} Room ${room.roomNumber}`}
                      className="w-full h-72 object-cover"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-gold">
                        {formatPrice(room.price)}
                        <span className="text-base text-muted-foreground font-normal">/night</span>
                      </p>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{room.description}</p>

                    <div>
                      <h3 className="font-semibold mb-3">Room Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {room.features.map(feature => (
                          <Badge key={feature} variant="outline" className="gap-2 py-1.5 px-3">
                            {featureIcons[feature]}
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div>
                <BookingForm room={room} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BookRoom;
