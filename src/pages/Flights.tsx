import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plane, Search, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Flight {
  id: string;
  airline: string;
  flight_number: string;
  departure_city: string;
  arrival_city: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
}

const Flights = () => {
  const { toast } = useToast();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async (from?: string, to?: string) => {
    setLoading(true);
    let query = supabase.from("flights").select("*");
    
    if (from) {
      query = query.ilike("departure_city", `%${from}%`);
    }
    if (to) {
      query = query.ilike("arrival_city", `%${to}%`);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch flights",
      });
    } else {
      setFlights(data || []);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFlights(searchFrom, searchTo);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-gradient">Search Flights</h1>
              <p className="text-muted-foreground">Find the best flights for your journey</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from">From</Label>
                      <Input
                        id="from"
                        placeholder="Departure city..."
                        value={searchFrom}
                        onChange={(e) => setSearchFrom(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to">To</Label>
                      <Input
                        id="to"
                        placeholder="Arrival city..."
                        value={searchTo}
                        onChange={(e) => setSearchTo(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full btn-gradient">
                    <Search className="w-4 h-4 mr-2" />
                    Search Flights
                  </Button>
                </form>
              </CardContent>
            </Card>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {flights.map((flight) => (
                  <Card key={flight.id} className="card-hover">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Plane className="w-5 h-5 text-primary" />
                          {flight.airline}
                        </CardTitle>
                        <Badge>{flight.flight_number}</Badge>
                      </div>
                      <CardDescription>
                        {flight.available_seats} seats available
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{flight.departure_city}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(flight.departure_time), "MMM dd, HH:mm")}
                          </p>
                        </div>
                        <Plane className="w-8 h-8 text-muted-foreground rotate-90" />
                        <div className="text-right">
                          <p className="text-2xl font-bold">{flight.arrival_city}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            {format(new Date(flight.arrival_time), "MMM dd, HH:mm")}
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        ${flight.price}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full btn-gradient">
                        Book Flight
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

export default Flights;