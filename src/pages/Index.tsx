import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hotel, Plane, Utensils, MapPin, Compass, User } from "lucide-react";
import { Session } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      title: "Hotels",
      description: "Find and book amazing hotels",
      icon: Hotel,
      path: "/hotels",
      color: "from-primary to-primary/80",
    },
    {
      title: "Flights",
      description: "Search for the best flights",
      icon: Plane,
      path: "/flights",
      color: "from-accent to-accent/80",
    },
    {
      title: "Restaurants",
      description: "Discover great dining spots",
      icon: Utensils,
      path: "/restaurants",
      color: "from-secondary to-secondary/80",
    },
    {
      title: "Tours",
      description: "Explore exciting tour packages",
      icon: Compass,
      path: "/tours",
      color: "from-primary to-accent",
    },
    {
      title: "Locations",
      description: "Find parking & shopping malls",
      icon: MapPin,
      path: "/locations",
      color: "from-accent to-secondary",
    },
    {
      title: "Profile",
      description: "View your bookings",
      icon: User,
      path: "/profile",
      color: "from-secondary to-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mb-4 shadow-lg">
              <Plane className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-4">
              Welcome to TravelMate
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your all-in-one travel companion for booking hotels, flights, restaurants, and exploring amazing destinations
            </p>
            {!session && (
              <div className="pt-4">
                <Button 
                  onClick={() => navigate("/auth")} 
                  size="lg"
                  className="btn-gradient text-white"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.path}
                className="card-hover cursor-pointer group"
                onClick={() => {
                  if (!session && feature.path !== "/") {
                    navigate("/auth");
                  } else {
                    navigate(feature.path);
                  }
                }}
              >
                <CardHeader>
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full group-hover:bg-primary/10">
                    Explore →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer CTA */}
          {session && (
            <div className="text-center pt-8">
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-none">
                <CardContent className="py-8">
                  <h2 className="text-2xl font-bold mb-2">Ready for your next adventure?</h2>
                  <p className="text-muted-foreground mb-4">
                    Start exploring and book your perfect trip today
                  </p>
                  <Button onClick={() => navigate("/hotels")} className="btn-gradient">
                    Browse Hotels
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
