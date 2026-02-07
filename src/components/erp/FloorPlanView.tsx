import { useState, DragEvent } from 'react';
import { Room } from '@/types/hotel';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { getCheckInRecords, reassignRoom, checkInGuest, CheckInRecord } from '@/lib/erpData';
import { BedDouble, Users, DollarSign, GripVertical, UserCheck } from 'lucide-react';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

const typeColors: Record<string, string> = {
  standard: 'bg-blue-500',
  deluxe: 'bg-purple-500',
  executive: 'bg-amber-500',
  suite: 'bg-emerald-500',
  presidential: 'bg-rose-500',
};

interface FloorPlanViewProps {
  rooms: Room[];
  onToggle: (room: Room) => void;
}

export function FloorPlanView({ rooms, onToggle }: FloorPlanViewProps) {
  const { toast } = useToast();
  const [floorFilter, setFloorFilter] = useState('all');
  const [dragOverRoom, setDragOverRoom] = useState<string | null>(null);
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>(getCheckInRecords());

  const refreshRecords = () => setCheckInRecords(getCheckInRecords());

  // Guests waiting for check-in (expected status)
  const pendingGuests = checkInRecords.filter(r => r.status === 'expected');

  const getFloor = (roomNumber: string) => Math.floor(parseInt(roomNumber) / 100);
  const floors = [...new Set(rooms.map(r => getFloor(r.room_number)))].sort((a, b) => a - b);

  const filteredRooms = floorFilter === 'all'
    ? rooms
    : rooms.filter(r => getFloor(r.room_number) === parseInt(floorFilter));

  const groupedByFloor = floors
    .filter(f => floorFilter === 'all' || f === parseInt(floorFilter))
    .map(floor => ({
      floor,
      rooms: filteredRooms.filter(r => getFloor(r.room_number) === floor),
    }));

  const available = rooms.filter(r => r.is_available).length;
  const occupied = rooms.length - available;

  // Find which guest is assigned to a room
  const guestInRoom = (roomId: string) =>
    checkInRecords.find(r => r.room_id === roomId && r.status === 'checked_in');

  // Drag handlers
  const handleDragStart = (e: DragEvent, record: CheckInRecord) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ checkInId: record.id, guestName: record.guest_name }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent, room: Room) => {
    if (!room.is_available) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverRoom(room.id);
  };

  const handleDragLeave = () => setDragOverRoom(null);

  const handleDrop = (e: DragEvent, room: Room) => {
    e.preventDefault();
    setDragOverRoom(null);
    if (!room.is_available) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { checkInId, guestName } = data;

      // Reassign room and check in
      reassignRoom(checkInId, room.id, room.room_number);
      checkInGuest(checkInId);
      refreshRecords();
      onToggle(room); // Mark room as occupied

      toast({
        title: `✅ ${guestName} assigned to Room ${room.room_number}`,
        description: `Checked in at ${new Date().toLocaleTimeString()}`,
      });
    } catch {
      toast({ title: 'Drop failed', variant: 'destructive' });
    }
  };

  return (
    <div className="flex gap-4">
      {/* Guest sidebar */}
      <Card className="w-64 shrink-0 self-start sticky top-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <UserCheck className="h-4 w-4" />
            Pending Check-ins
          </CardTitle>
          <p className="text-xs text-muted-foreground">Drag a guest onto an available room</p>
        </CardHeader>
        <CardContent className="space-y-1.5 max-h-[60vh] overflow-y-auto">
          {pendingGuests.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No pending guests</p>
          ) : pendingGuests.map(record => (
            <div
              key={record.id}
              draggable
              onDragStart={e => handleDragStart(e, record)}
              className="flex items-center gap-2 p-2 rounded-md border cursor-grab active:cursor-grabbing
                bg-card hover:bg-accent/50 transition-colors text-sm group"
            >
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-xs truncate">{record.guest_name}</p>
                <p className="text-xs text-muted-foreground">Room {record.room_number}</p>
              </div>
              <Badge variant="secondary" className="text-[10px] shrink-0">Expected</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Floor plan */}
      <div className="flex-1 space-y-6 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-serif font-bold">Floor Plan</h1>
            <p className="text-sm text-muted-foreground">
              <span className="text-green-600 font-medium">{available}</span> available ·{' '}
              <span className="text-red-600 font-medium">{occupied}</span> occupied ·{' '}
              <span className="font-medium">{rooms.length}</span> total
            </p>
          </div>
          <Select value={floorFilter} onValueChange={setFloorFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Floor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              {floors.map(f => (
                <SelectItem key={f} value={String(f)}>Floor {f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Legend */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-4 items-center text-xs">
              <span className="font-medium text-muted-foreground">Types:</span>
              {Object.entries(typeColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${color}`} />
                  <span className="capitalize">{type}</span>
                </div>
              ))}
              <span className="mx-2 text-muted-foreground">|</span>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-500/30 border border-green-500" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-500/30 border border-red-500" />
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm border-2 border-dashed border-blue-400 bg-blue-500/20" />
                <span>Drop target</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floor Plans */}
        <TooltipProvider delayDuration={200}>
          {groupedByFloor.map(({ floor, rooms: floorRooms }) => {
            const floorAvailable = floorRooms.filter(r => r.is_available).length;
            return (
              <Card key={floor}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-serif">Floor {floor}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {floorAvailable}/{floorRooms.length} available
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-1.5">
                    {floorRooms.map(room => {
                      const guest = guestInRoom(room.id);
                      const isDropTarget = dragOverRoom === room.id;
                      return (
                        <Tooltip key={room.id}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onToggle(room)}
                              onDragOver={e => handleDragOver(e, room)}
                              onDragLeave={handleDragLeave}
                              onDrop={e => handleDrop(e, room)}
                              className={`
                                relative p-1.5 rounded-md border-2 transition-all duration-200
                                hover:scale-110 hover:shadow-lg hover:z-10
                                ${isDropTarget
                                  ? 'border-dashed border-blue-400 bg-blue-500/20 scale-110 shadow-lg ring-2 ring-blue-400/50'
                                  : room.is_available
                                    ? 'bg-green-500/10 border-green-400 hover:bg-green-500/20'
                                    : 'bg-red-500/10 border-red-400 hover:bg-red-500/20'
                                }
                              `}
                            >
                              <div className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${typeColors[room.type]}`} />
                              <div className="text-center">
                                <p className="text-xs font-bold leading-tight">{room.room_number}</p>
                                <BedDouble className={`h-3 w-3 mx-auto ${room.is_available ? 'text-green-600' : 'text-red-600'}`} />
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="space-y-1">
                            <p className="font-bold">Room {room.room_number}</p>
                            <p className="capitalize text-xs">{room.type} · {room.is_available ? '✅ Available' : '🔴 Occupied'}</p>
                            {guest && <p className="text-xs font-medium text-blue-600">🧑 {guest.guest_name}</p>}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />{room.capacity}</span>
                              <span className="flex items-center gap-0.5"><DollarSign className="h-3 w-3" />{formatPrice(room.price_per_night)}/night</span>
                            </div>
                            {room.is_available
                              ? <p className="text-xs text-blue-600 italic">Drop a guest here to assign</p>
                              : <p className="text-xs text-muted-foreground italic">Click to toggle status</p>
                            }
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
