import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RoomCard } from '@/components/RoomCard';
import { RoomFilters } from '@/components/RoomFilters';
import { Pagination } from '@/components/Pagination';
import { fetchRooms } from '@/lib/api';
import { RoomFeature, RoomType, Room } from '@/types/hotel';
import { Skeleton } from '@/components/ui/skeleton';

const ROOMS_PER_PAGE = 25;

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState<RoomType | 'all'>('all');
  const [selectedFeatures, setSelectedFeatures] = useState<RoomFeature[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    fetchRooms()
      .then(setRooms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredRooms = rooms.filter(room => {
    if (availableOnly && !room.is_available) return false;
    if (selectedType !== 'all' && room.type !== selectedType) return false;
    if (selectedFeatures.length > 0) {
      const hasAllFeatures = selectedFeatures.every(f => room.features.includes(f));
      if (!hasAllFeatures) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROOMS_PER_PAGE;
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + ROOMS_PER_PAGE);

  const handleFeatureToggle = (feature: RoomFeature) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
    setCurrentPage(1);
  };

  const handleTypeChange = (type: RoomType | 'all') => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedType('all');
    setSelectedFeatures([]);
    setAvailableOnly(false);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        <section className="py-12 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <span className="text-gold uppercase tracking-[0.2em] text-sm font-medium">Accommodations</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mt-2">Our Rooms</h1>
            <p className="text-muted-foreground mt-4 max-w-2xl">
              Choose from our collection of 150 luxurious rooms, each designed to provide comfort, elegance, and an unforgettable stay.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <RoomFilters
                  selectedType={selectedType}
                  selectedFeatures={selectedFeatures}
                  availableOnly={availableOnly}
                  onTypeChange={handleTypeChange}
                  onFeatureToggle={handleFeatureToggle}
                  onAvailableChange={setAvailableOnly}
                  onClearFilters={handleClearFilters}
                />
              </div>

              <div className="lg:col-span-3">
                {loading ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-80 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(startIndex + ROOMS_PER_PAGE, filteredRooms.length)} of {filteredRooms.length} rooms
                      </p>
                    </div>

                    {paginatedRooms.length > 0 ? (
                      <>
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                          {paginatedRooms.map(room => (
                            <RoomCard key={room.id} room={room} />
                          ))}
                        </div>

                        {totalPages > 1 && (
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                          />
                        )}
                      </>
                    ) : (
                      <div className="text-center py-16">
                        <p className="text-muted-foreground text-lg">No rooms match your filters.</p>
                        <button
                          onClick={handleClearFilters}
                          className="text-gold hover:underline mt-2"
                        >
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Rooms;