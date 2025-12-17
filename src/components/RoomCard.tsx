import { Room } from '@/types/hotel';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Wifi, Wind, Tv, Coffee, Bath, UtensilsCrossed, Mountain, BedDouble, BedSingle } from 'lucide-react';

const featureIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="h-3 w-3" />,
  'AC': <Wind className="h-3 w-3" />,
  'TV': <Tv className="h-3 w-3" />,
  'Mini Fridge': <Coffee className="h-3 w-3" />,
  'Bathtub': <Bath className="h-3 w-3" />,
  'Room Service': <UtensilsCrossed className="h-3 w-3" />,
  'Sea View': <Mountain className="h-3 w-3" />,
  'Balcony': <Mountain className="h-3 w-3" />,
  'King Bed': <BedDouble className="h-3 w-3" />,
  'Twin Beds': <BedSingle className="h-3 w-3" />,
};

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const typeLabel = room.type.charAt(0).toUpperCase() + room.type.slice(1);

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50">
      <div className="relative h-48 overflow-hidden">
        <img
          src={room.image_url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'}
          alt={`${typeLabel} Room ${room.room_number}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm font-medium">
            Room {room.room_number}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge 
            variant={room.is_available ? 'default' : 'destructive'}
            className={room.is_available ? 'bg-green-600' : ''}
          >
            {room.is_available ? 'Available' : 'Booked'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-serif font-semibold">{typeLabel}</h3>
            <p className="text-gold font-semibold text-lg">{formatPrice(room.price_per_night)}<span className="text-sm text-muted-foreground font-normal">/night</span></p>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{room.description}</p>

        <div className="flex flex-wrap gap-2">
          {room.features.slice(0, 5).map(feature => (
            <Badge key={feature} variant="outline" className="text-xs gap-1">
              {featureIcons[feature]}
              {feature}
            </Badge>
          ))}
          {room.features.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{room.features.length - 5} more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link to={`/book/${room.id}`} className="w-full">
          <Button 
            className="w-full bg-gold hover:bg-gold-dark text-primary-foreground"
            disabled={!room.is_available}
          >
            {room.is_available ? 'Book Now' : 'Not Available'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}