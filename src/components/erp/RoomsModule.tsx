import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getRooms, updateRoomAvailability } from '@/lib/mockData';
import { Room } from '@/types/hotel';
import { BedDouble, Users, ToggleLeft, ToggleRight } from 'lucide-react';

export function RoomsModule() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState(getRooms());
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const refresh = () => setRooms(getRooms());

  const toggleAvailability = (room: Room) => {
    updateRoomAvailability(room.id, !room.is_available);
    toast({ title: `Room ${room.room_number} ${!room.is_available ? 'available' : 'unavailable'}` });
    refresh();
  };

  const filtered = rooms.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (statusFilter === 'available' && !r.is_available) return false;
    if (statusFilter === 'occupied' && r.is_available) return false;
    return true;
  });

  const available = rooms.filter(r => r.is_available).length;
  const occupied = rooms.length - available;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold">Room Status</h1>
          <p className="text-sm text-muted-foreground">
            <span className="text-green-600 font-medium">{available}</span> available · <span className="text-red-600 font-medium">{occupied}</span> occupied
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="deluxe">Deluxe</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
              <SelectItem value="presidential">Presidential</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filtered.map(room => (
          <Card
            key={room.id}
            className={`cursor-pointer transition-all hover:shadow-md ${room.is_available ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}
            onClick={() => toggleAvailability(room)}
          >
            <CardContent className="p-3 text-center space-y-1">
              <BedDouble className={`h-6 w-6 mx-auto ${room.is_available ? 'text-green-600' : 'text-red-600'}`} />
              <p className="font-bold text-lg">{room.room_number}</p>
              <p className="text-xs capitalize text-muted-foreground">{room.type}</p>
              <Badge variant={room.is_available ? 'default' : 'destructive'} className="text-xs">
                {room.is_available ? 'Available' : 'Occupied'}
              </Badge>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />{room.capacity}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
