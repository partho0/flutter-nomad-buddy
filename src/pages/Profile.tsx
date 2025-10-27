import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Booking {
  id: string;
  booking_type: string;
  item_name: string;
  booking_date: string;
  check_in_date: string | null;
  check_out_date: string | null;
  total_price: number;
  status: string;
}

interface Profile {
  full_name: string;
  phone: string | null;
}

const Profile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileAndBookings();
  }, []);

  const fetchProfileAndBookings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch profile",
        });
      } else {
        setProfile(profileData);
      }

      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("booking_date", { ascending: false });

      if (bookingsError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch bookings",
        });
      } else {
        setBookings(bookingsData || []);
      }
    }
    setLoading(false);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-gradient">My Profile</h1>
              <p className="text-muted-foreground">Manage your account and bookings</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="text-lg font-semibold">{profile?.full_name || "Not set"}</p>
                    </div>
                    {profile?.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-lg font-semibold">{profile.phone}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Booking History
                    </CardTitle>
                    <CardDescription>
                      {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bookings.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No bookings yet</p>
                    ) : (
                      bookings.map((booking) => (
                        <Card key={booking.id} className="card-hover">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg">{booking.item_name}</CardTitle>
                              <Badge
                                className={
                                  booking.status === "confirmed"
                                    ? "bg-primary"
                                    : booking.status === "completed"
                                    ? "bg-secondary"
                                    : "bg-destructive"
                                }
                              >
                                {booking.status}
                              </Badge>
                            </div>
                            <CardDescription className="capitalize">
                              {booking.booking_type} booking
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Booked on: {format(new Date(booking.booking_date), "PPP")}
                            </p>
                            {booking.check_in_date && booking.check_out_date && (
                              <p className="text-sm text-muted-foreground">
                                Stay: {format(new Date(booking.check_in_date), "MMM dd")} -{" "}
                                {format(new Date(booking.check_out_date), "MMM dd, yyyy")}
                              </p>
                            )}
                            <p className="text-lg font-bold text-primary flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {booking.total_price}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Profile;