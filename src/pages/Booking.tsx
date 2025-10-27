import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

const Booking = () => {
  const { type, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const item = location.state?.hotel;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to book",
      });
      setLoading(false);
      return;
    }

    if (!item) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Item information is missing",
      });
      setLoading(false);
      return;
    }

    const nights = Math.ceil(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = item.price_per_night * nights;

    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      booking_type: type as string,
      item_id: id as string,
      item_name: item.name,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      total_price: totalPrice,
      status: "confirmed",
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create booking",
      });
    } else {
      toast({
        title: "Success!",
        description: "Your booking has been confirmed",
      });
      navigate("/profile");
    }
  };

  if (!item) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-muted-foreground">No item information available</p>
              <Button onClick={() => navigate("/hotels")} className="mt-4">
                Go back
              </Button>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-gradient">Complete Your Booking</h1>
              <p className="text-muted-foreground">Fill in the details below</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.location}, {item.city}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="check-in" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Check-in Date
                    </Label>
                    <Input
                      id="check-in"
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="check-out" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Check-out Date
                    </Label>
                    <Input
                      id="check-out"
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      required
                      min={checkInDate || new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  {checkInDate && checkOutDate && (
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Price per night:</span>
                        <span className="font-semibold">${item.price_per_night}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Number of nights:</span>
                        <span className="font-semibold">
                          {Math.ceil(
                            (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t">
                        <span>Total:</span>
                        <span>
                          $
                          {item.price_per_night *
                            Math.ceil(
                              (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full btn-gradient" disabled={loading}>
                    {loading ? "Confirming..." : "Confirm Booking"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Booking;