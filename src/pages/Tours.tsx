import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Tour {
  id: string;
  name: string;
  description: string;
  destination: string;
  duration_days: number;
  price: number;
  rating: number;
  highlights: string[];
}

const Tours = () => {
  const { toast } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("tours").select("*");

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch tours",
      });
    } else {
      setTours(data || []);
    }
    setLoading(false);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-gradient">Amazing Tours & Adventures</h1>
              <p className="text-muted-foreground">Discover unforgettable experiences</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tours.map((tour) => (
                  <Card key={tour.id} className="card-hover">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span>{tour.name}</span>
                        <Badge className="bg-primary">
                          {tour.rating} <Star className="w-3 h-3 ml-1 fill-current" />
                        </Badge>
                      </CardTitle>
                      <CardDescription>{tour.destination}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{tour.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-primary" />
                          {tour.duration_days} days
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-primary" />
                          ${tour.price}
                        </span>
                      </div>

                      {tour.highlights && tour.highlights.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground">Highlights:</p>
                          <div className="flex flex-wrap gap-2">
                            {tour.highlights.map((highlight, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full btn-gradient">
                        Book Tour
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

export default Tours;