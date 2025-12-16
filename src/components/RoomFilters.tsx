import { RoomFeature, RoomType } from '@/types/hotel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

const allFeatures: RoomFeature[] = ['AC', 'TV', 'Balcony', 'Sea View', 'King Bed', 'Twin Beds', 'Mini Fridge', 'WiFi', 'Bathtub', 'Room Service'];
const roomTypes: RoomType[] = ['Standard', 'Deluxe', 'Executive', 'Suite', 'Presidential'];

interface RoomFiltersProps {
  selectedType: RoomType | 'all';
  selectedFeatures: RoomFeature[];
  availableOnly: boolean;
  onTypeChange: (type: RoomType | 'all') => void;
  onFeatureToggle: (feature: RoomFeature) => void;
  onAvailableChange: (available: boolean) => void;
  onClearFilters: () => void;
}

export function RoomFilters({
  selectedType,
  selectedFeatures,
  availableOnly,
  onTypeChange,
  onFeatureToggle,
  onAvailableChange,
  onClearFilters,
}: RoomFiltersProps) {
  const hasFilters = selectedType !== 'all' || selectedFeatures.length > 0 || availableOnly;

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold">Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Room Type</Label>
        <Select value={selectedType} onValueChange={(value) => onTypeChange(value as RoomType | 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {roomTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Features</Label>
        <div className="flex flex-wrap gap-2">
          {allFeatures.map(feature => (
            <Badge
              key={feature}
              variant={selectedFeatures.includes(feature) ? 'default' : 'outline'}
              className={`cursor-pointer transition-colors ${
                selectedFeatures.includes(feature) 
                  ? 'bg-gold hover:bg-gold-dark' 
                  : 'hover:bg-accent'
              }`}
              onClick={() => onFeatureToggle(feature)}
            >
              {feature}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="available" 
          checked={availableOnly}
          onCheckedChange={(checked) => onAvailableChange(checked as boolean)}
        />
        <Label htmlFor="available" className="text-sm cursor-pointer">
          Available rooms only
        </Label>
      </div>
    </div>
  );
}
