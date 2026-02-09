import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { erpListRooms, erpUpdateRoom } from '@/lib/erp-api';
import { getERPToken } from '@/lib/erp-auth';
import { Room as HotelRoom } from '@/types/hotel';
import { BedDouble, Users, LayoutGrid, Map } from 'lucide-react';
import { FloorPlanView } from './FloorPlanView';

export function RoomsModule() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'grid' | 'floorplan'>('floorplan');

  // Real-time polling every 5 seconds
  const refresh = async () => {
    const token = getERPToken();
    if (!token) return;
    const data = await erpListRooms(token);
    const mapped: HotelRoom[] = data.map((r: any) => ({
      id: String(r.id),
      room_number: String(r.id),
      type: r.room_type,
      name: r.name,
      description: "",
      price_per_night: r.price,
      capacity: r.capacity,
      features: r.amenities ? String(r.amenities).split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      image_url: r.image_url,
      is_available: r.is_available,
    }));
    setRooms(mapped);
  };

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  const toggleAvailability = async (room: HotelRoom) => {
    const token = getERPToken();
    if (!token) return;
    await erpUpdateRoom(token, Number(room.id), { is_available: !room.is_available });
    toast({ title: `Room ${room.room_number} ${!room.is_available ? 'available' : 'unavailable'}` });
    refresh();
  };

  const filtered = rooms.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (statusFilter === 'available' && !r.is_available) return false;
    if (statusFilter === 'occupied' && r.is_available) return false;
    return true;
  });

  if (view === 'floorplan') {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Tabs value={view} onValueChange={v => setView(v as 'grid' | 'floorplan')}>
            <TabsList className="h-8">
              <TabsTrigger value="floorplan" className="text-xs gap-1"><Map className="h-3 w-3" />Floor Plan</TabsTrigger>
              <TabsTrigger value="grid" className="text-xs gap-1"><LayoutGrid className="h-3 w-3" />Grid</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <FloorPlanView rooms={filtered} onToggle={toggleAvailability} />
      </div>
    );
  }

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
          <Tabs value={view} onValueChange={v => setView(v as 'grid' | 'floorplan')}>
            <TabsList className="h-8">
              <TabsTrigger value="floorplan" className="text-xs gap-1"><Map className="h-3 w-3" />Floor Plan</TabsTrigger>
              <TabsTrigger value="grid" className="text-xs gap-1"><LayoutGrid className="h-3 w-3" />Grid</TabsTrigger>
            </TabsList>
          </Tabs>
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
