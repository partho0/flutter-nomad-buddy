-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Hotels table
CREATE TABLE public.hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text NOT NULL,
  city text NOT NULL,
  price_per_night numeric NOT NULL,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  image_url text,
  amenities text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hotels are viewable by everyone"
  ON public.hotels FOR SELECT
  USING (true);

-- Flights table
CREATE TABLE public.flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airline text NOT NULL,
  flight_number text NOT NULL,
  departure_city text NOT NULL,
  arrival_city text NOT NULL,
  departure_time timestamptz NOT NULL,
  arrival_time timestamptz NOT NULL,
  price numeric NOT NULL,
  available_seats integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flights are viewable by everyone"
  ON public.flights FOR SELECT
  USING (true);

-- Restaurants table
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cuisine text NOT NULL,
  location text NOT NULL,
  city text NOT NULL,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  price_range text,
  latitude numeric,
  longitude numeric,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurants are viewable by everyone"
  ON public.restaurants FOR SELECT
  USING (true);

-- Tours table
CREATE TABLE public.tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  destination text NOT NULL,
  duration_days integer NOT NULL,
  price numeric NOT NULL,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  image_url text,
  highlights text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tours are viewable by everyone"
  ON public.tours FOR SELECT
  USING (true);

-- Parking/Shopping Malls table
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('parking', 'shopping_mall')),
  address text NOT NULL,
  city text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locations are viewable by everyone"
  ON public.locations FOR SELECT
  USING (true);

-- Bookings table
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_type text NOT NULL CHECK (booking_type IN ('hotel', 'flight', 'tour')),
  item_id uuid NOT NULL,
  item_name text NOT NULL,
  booking_date timestamptz DEFAULT now(),
  check_in_date timestamptz,
  check_out_date timestamptz,
  total_price numeric NOT NULL,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert sample data for hotels
INSERT INTO public.hotels (name, description, location, city, price_per_night, rating, amenities) VALUES
  ('Grand Plaza Hotel', 'Luxury hotel in the heart of the city', '123 Main Street', 'New York', 250, 4.5, ARRAY['WiFi', 'Pool', 'Gym', 'Restaurant']),
  ('Ocean View Resort', 'Beautiful beachfront resort', '456 Beach Road', 'Miami', 180, 4.7, ARRAY['WiFi', 'Beach Access', 'Spa', 'Restaurant']),
  ('Mountain Lodge', 'Cozy lodge with mountain views', '789 Mountain Trail', 'Denver', 150, 4.3, ARRAY['WiFi', 'Fireplace', 'Hiking Trails']),
  ('City Center Inn', 'Affordable hotel with great location', '321 City Avenue', 'Chicago', 120, 4.0, ARRAY['WiFi', 'Free Breakfast']),
  ('Paradise Hotel', 'Tropical paradise with all amenities', '654 Palm Street', 'Los Angeles', 200, 4.6, ARRAY['WiFi', 'Pool', 'Gym', 'Spa']);

-- Insert sample data for flights
INSERT INTO public.flights (airline, flight_number, departure_city, arrival_city, departure_time, arrival_time, price, available_seats) VALUES
  ('SkyAir', 'SA101', 'New York', 'Los Angeles', now() + interval '2 days', now() + interval '2 days 6 hours', 320, 150),
  ('Global Wings', 'GW202', 'Miami', 'Chicago', now() + interval '3 days', now() + interval '3 days 3 hours', 250, 180),
  ('AeroJet', 'AJ303', 'Denver', 'New York', now() + interval '4 days', now() + interval '4 days 4 hours', 280, 120),
  ('Pacific Air', 'PA404', 'Los Angeles', 'Miami', now() + interval '5 days', now() + interval '5 days 5 hours', 350, 200),
  ('Eagle Express', 'EE505', 'Chicago', 'Denver', now() + interval '6 days', now() + interval '6 days 2 hours', 180, 160);

-- Insert sample data for restaurants
INSERT INTO public.restaurants (name, cuisine, location, city, rating, price_range, latitude, longitude) VALUES
  ('Italian Bistro', 'Italian', '100 Pasta Lane', 'New York', 4.5, '$$', 40.7128, -74.0060),
  ('Sushi Paradise', 'Japanese', '200 Sushi Street', 'Los Angeles', 4.7, '$$$', 34.0522, -118.2437),
  ('Taco Fiesta', 'Mexican', '300 Taco Avenue', 'Miami', 4.3, '$', 25.7617, -80.1918),
  ('French Cafe', 'French', '400 Croissant Road', 'Chicago', 4.6, '$$$$', 41.8781, -87.6298),
  ('BBQ Smokehouse', 'American', '500 BBQ Boulevard', 'Denver', 4.4, '$$', 39.7392, -104.9903);

-- Insert sample data for tours
INSERT INTO public.tours (name, description, destination, duration_days, price, rating, highlights) VALUES
  ('Grand Canyon Adventure', 'Explore the magnificent Grand Canyon', 'Arizona', 3, 450, 4.8, ARRAY['Hiking', 'Photography', 'Guided Tours']),
  ('New York City Explorer', 'See all the iconic NYC landmarks', 'New York', 2, 350, 4.6, ARRAY['Statue of Liberty', 'Times Square', 'Central Park']),
  ('Miami Beach Getaway', 'Relax on beautiful Miami beaches', 'Miami', 4, 550, 4.7, ARRAY['Beach Activities', 'Water Sports', 'Nightlife']),
  ('Rocky Mountain Expedition', 'Adventure in the Rocky Mountains', 'Colorado', 5, 680, 4.9, ARRAY['Hiking', 'Wildlife', 'Scenic Views']),
  ('California Coastal Drive', 'Drive along the stunning Pacific Coast', 'California', 7, 890, 4.8, ARRAY['Scenic Drives', 'Beach Stops', 'Wine Tasting']);

-- Insert sample data for locations
INSERT INTO public.locations (name, type, address, city, latitude, longitude) VALUES
  ('Downtown Parking', 'parking', '100 Main Street', 'New York', 40.7589, -73.9851),
  ('City Mall', 'shopping_mall', '200 Shopping Plaza', 'Los Angeles', 34.0522, -118.2437),
  ('Beach Parking Lot', 'parking', '300 Ocean Drive', 'Miami', 25.7907, -80.1300),
  ('Mega Shopping Center', 'shopping_mall', '400 Mall Avenue', 'Chicago', 41.8781, -87.6298),
  ('Mountain Parking', 'parking', '500 Peak Road', 'Denver', 39.7392, -104.9903);