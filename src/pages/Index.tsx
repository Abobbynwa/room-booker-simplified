import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Crown, Star, Wifi, Car, Utensils, Waves } from "lucide-react";

const Index = () => {
  const amenities = [
    { icon: Wifi, label: "Free WiFi" },
    { icon: Car, label: "Free Parking" },
    { icon: Utensils, label: "Restaurant" },
    { icon: Waves, label: "Swimming Pool" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/60 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Crown className="h-8 w-8 text-primary" />
            <span className="text-primary font-serif text-lg tracking-widest uppercase">Luxury Awaits</span>
            <Crown className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6 leading-tight">
            Experience Unparalleled <span className="text-primary">Elegance</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover 150 exquisitely designed rooms, where every detail speaks of luxury 
            and every moment becomes an unforgettable memory.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/rooms">Browse Our Rooms</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/booking-status">Check Booking Status</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              World-Class Amenities
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every guest deserves the finest. Enjoy our premium facilities designed for your comfort.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {amenities.map((amenity, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <amenity.icon className="h-10 w-10 text-primary" />
                </div>
                <p className="font-medium text-foreground">{amenity.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Types Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              Our Accommodations
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From cozy standard rooms to our magnificent Presidential Suite, 
              find your perfect retreat.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                type: "Standard & Deluxe",
                description: "Comfortable elegance for the discerning traveler",
                price: "From ₦25,000",
              },
              {
                type: "Executive & Suite",
                description: "Spacious luxury with premium amenities",
                price: "From ₦50,000",
              },
              {
                type: "Presidential",
                description: "The pinnacle of opulence and exclusivity",
                price: "From ₦150,000",
              },
            ].map((room, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors group"
              >
                <div className="flex justify-center mb-4">
                  {[...Array(index + 3)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-primary fill-primary" />
                  ))}
                </div>
                <h3 className="font-serif text-2xl text-foreground mb-2">{room.type}</h3>
                <p className="text-muted-foreground mb-4">{room.description}</p>
                <p className="text-primary font-semibold text-lg">{room.price}/night</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link to="/rooms">View All 150 Rooms</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
            Ready to Experience Luxury?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Book your stay today and let us exceed your expectations. 
            Simple bank transfer payment, no hassle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/rooms">Book Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
