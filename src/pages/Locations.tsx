import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ParkingCircle, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Location {
  id: string;
  name: string;
  type: "parking" | "shopping_mall";
  address: string;
  city: string;
  latitude: number;
  longitude: number;
}

const Locations = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("locations").select("*");

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch locations",
      });
    } else {
      setLocations((data || []) as Location[]);
    }
    setLoading(false);
  };

  const parkingLocations = locations.filter((l) => l.type === "parking");
  const shoppingMalls = locations.filter((l) => l.type === "shopping_mall");

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-gradient">Find Locations</h1>
              <p className="text-muted-foreground">Parking spots and shopping malls near you</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <Tabs defaultValue="parking" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="parking" className="flex items-center gap-2">
                    <ParkingCircle className="w-4 h-4" />
                    Parking
                  </TabsTrigger>
                  <TabsTrigger value="shopping" className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Shopping Malls
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="parking" className="space-y-4 mt-6">
                  {parkingLocations.map((location) => (
                    <Card key={location.id} className="card-hover">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ParkingCircle className="w-5 h-5 text-primary" />
                          {location.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {location.address}, {location.city}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="secondary">
                            Lat: {location.latitude.toFixed(4)}
                          </Badge>
                          <Badge variant="secondary">
                            Lng: {location.longitude.toFixed(4)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="shopping" className="space-y-4 mt-6">
                  {shoppingMalls.map((location) => (
                    <Card key={location.id} className="card-hover">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5 text-primary" />
                          {location.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {location.address}, {location.city}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="secondary">
                            Lat: {location.latitude.toFixed(4)}
                          </Badge>
                          <Badge variant="secondary">
                            Lng: {location.longitude.toFixed(4)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Locations;