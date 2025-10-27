import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  price_per_night: number;
  rating: number;
  amenities: string[];
}

const Hotels = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [searchCity, setSearchCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async (city?: string) => {
    setLoading(true);
    let query = supabase.from("hotels").select("*");
    
    if (city) {
      query = query.ilike("city", `%${city}%`);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch hotels",
      });
    } else {
      setHotels(data || []);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHotels(searchCity);
  };

  const handleBook = (hotel: Hotel) => {
    navigate(`/booking/hotel/${hotel.id}`, { state: { hotel } });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-gradient">Find Your Perfect Stay</h1>
              <p className="text-muted-foreground">Discover amazing hotels worldwide</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Search by City</Label>
                    <div className="flex gap-2">
                      <Input
                        id="city"
                        placeholder="Enter city name..."
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                      />
                      <Button type="submit" className="btn-gradient">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {hotels.map((hotel) => (
                  <Card key={hotel.id} className="card-hover">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span>{hotel.name}</span>
                        <Badge className="bg-primary">{hotel.rating} <Star className="w-3 h-3 ml-1 fill-current" /></Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {hotel.city}, {hotel.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{hotel.description}</p>
                      {hotel.amenities && hotel.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {hotel.amenities.map((amenity, index) => (
                            <Badge key={index} variant="secondary">{amenity}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="text-2xl font-bold text-primary">
                        ${hotel.price_per_night}
                        <span className="text-sm text-muted-foreground font-normal">/night</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => handleBook(hotel)} className="w-full btn-gradient">
                        Book Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Hotels;