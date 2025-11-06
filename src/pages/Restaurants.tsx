import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Search, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  city: string;
  rating: number;
  price_range: string;
  latitude: number;
  longitude: number;
}

const Restaurants = () => {
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchCity, setSearchCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async (city?: string) => {
    setLoading(true);
    let query = supabase.from("restaurants").select("*");
    
    if (city) {
      query = query.ilike("city", `%${city}%`);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch restaurants",
      });
    } else {
      setRestaurants(data || []);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRestaurants(searchCity);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-gradient">Discover Restaurants</h1>
              <p className="text-muted-foreground">Find the best places to dine</p>
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
                {restaurants.map((restaurant) => (
                  <Card key={restaurant.id} className="card-hover">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span className="flex items-center gap-2">
                          <Utensils className="w-5 h-5 text-primary" />
                          {restaurant.name}
                        </span>
                        <Badge className="bg-primary">
                          {restaurant.rating} <Star className="w-3 h-3 ml-1 fill-current" />
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {restaurant.city}, {restaurant.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{restaurant.cuisine}</Badge>
                        <span className="text-lg font-semibold text-primary">{restaurant.price_range}</span>
                      </div>
                    </CardContent>
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

export default Restaurants;