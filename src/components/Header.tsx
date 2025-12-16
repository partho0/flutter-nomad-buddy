import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plane, LogOut, ArrowLeft } from "lucide-react";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const isHomePage = location.pathname === "/";

  const handleBack = () => {
    navigate(-1);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {!isHomePage && (
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">TravelMate</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/profile")}>
            Profile
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};