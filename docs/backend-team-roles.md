# Backend Team Structure - 5 Member Roles

## Member 1: Database Architect

### Role Name
**Database Schema Designer & Migration Specialist**

### What They Do
- Design and create database tables
- Define relationships between tables
- Write SQL migrations for schema changes
- Ensure data integrity with constraints and foreign keys
- Plan data structure for scalability

### Why They Do This
- A well-designed database is the foundation of any application
- Proper schema design prevents data inconsistency
- Migrations allow version control of database structure
- Good structure makes queries faster and data management easier

### How They Do This
- Analyze application requirements
- Create Entity-Relationship diagrams
- Write SQL DDL (Data Definition Language) statements
- Use migration tools to version control changes
- Test schema with sample data

### Code Examples from Project

```sql
-- Creating the Hotels Table
CREATE TABLE public.hotels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  price_per_night NUMERIC NOT NULL,
  rating NUMERIC DEFAULT 0,
  amenities TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Creating the Bookings Table with Relationships
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL,
  booking_type TEXT NOT NULL,
  item_name TEXT NOT NULL,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  check_in_date TIMESTAMP WITH TIME ZONE,
  check_out_date TIMESTAMP WITH TIME ZONE,
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Creating Profiles Table for User Data
CREATE TABLE public.profiles (
  id UUID NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);
```

---

## Member 2: Authentication & User Management Engineer

### Role Name
**Authentication Specialist & User Security Engineer**

### What They Do
- Implement user authentication (signup/login)
- Create user profile management systems
- Set up automatic profile creation on signup
- Handle password security and session management
- Configure authentication settings

### Why They Do This
- Users need secure access to the application
- Profile data needs to be created automatically when users sign up
- Session management ensures users stay logged in securely
- Proper auth prevents unauthorized access to user data

### How They Do This
- Use Supabase Auth API for authentication
- Create database triggers for automatic profile creation
- Write authentication flows in React components
- Implement auth guards to protect routes
- Configure email confirmation and password policies

### Code Examples from Project

```sql
-- Trigger Function: Automatically Create Profile on Signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Trigger: Execute Function on New User
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE PROCEDURE public.handle_new_user();
```

```typescript
// Frontend: Auth Guard Component
// File: src/components/AuthGuard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) return null;
  return <>{children}</>;
};
```

```typescript
// Frontend: Sign Out Functionality
// File: src/components/Header.tsx (excerpt)
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
```

---

## Member 3: API & Edge Functions Developer

### Role Name
**Backend API & Serverless Functions Developer**

### What They Do
- Create serverless edge functions for backend logic
- Handle API integrations with external services
- Implement business logic that can't run on frontend
- Manage API secrets and environment variables
- Handle CORS and API security

### Why They Do This
- Some operations require server-side execution (API keys, sensitive logic)
- External API calls need to be secured on the backend
- Complex calculations shouldn't burden the frontend
- Server-side validation prevents client-side manipulation

### How They Do This
- Write Deno-based edge functions in TypeScript
- Use Supabase client in edge functions for database access
- Implement proper error handling and logging
- Set up CORS headers for web access
- Deploy functions automatically with the project

### Code Examples from Project

```typescript
// Example Edge Function Structure
// File: supabase/functions/example-function/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Your business logic here
    const { data, error } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
```

```typescript
// Calling Edge Function from Frontend
// Example usage in React component
const callEdgeFunction = async () => {
  const { data, error } = await supabase.functions.invoke('example-function', {
    body: { 
      bookingId: '123',
      action: 'confirm' 
    }
  });

  if (error) {
    console.error('Function error:', error);
    return;
  }

  console.log('Function response:', data);
};
```

---

## Member 4: Security & Access Control Engineer

### Role Name
**Row-Level Security (RLS) & Data Protection Specialist**

### What They Do
- Implement Row-Level Security policies on all tables
- Ensure users can only access their own data
- Create security definer functions for complex checks
- Prevent unauthorized data access and manipulation
- Test security policies thoroughly

### Why They Do This
- Database security is critical to protect user privacy
- RLS policies enforce data access at the database level
- Even if frontend is compromised, database stays secure
- Compliance requirements demand proper access control
- Prevents data leaks and unauthorized modifications

### How They Do This
- Write SQL RLS policies for each table
- Test policies with different user scenarios
- Use `auth.uid()` to match current user
- Create policies for SELECT, INSERT, UPDATE, DELETE operations
- Enable RLS on all user-facing tables

### Code Examples from Project

```sql
-- RLS Policies for Profiles Table
-- Users can only view their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- RLS Policies for Bookings Table
-- Users can only see and manage their own bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for Public Data (Hotels, Flights, etc.)
-- Everyone can view, but only admins can modify
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hotels are viewable by everyone" 
ON public.hotels 
FOR SELECT 
USING (true);

ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flights are viewable by everyone" 
ON public.flights 
FOR SELECT 
USING (true);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurants are viewable by everyone" 
ON public.restaurants 
FOR SELECT 
USING (true);

ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tours are viewable by everyone" 
ON public.tours 
FOR SELECT 
USING (true);
```

```sql
-- Advanced: Security Definer Function for Role-Based Access
-- (Example for future admin features)

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy using the function
CREATE POLICY "Admins can manage all data"
ON public.hotels
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
```

---

## Member 5: Data Integration & Real-time Specialist

### Role Name
**Frontend-Backend Integration & Real-time Data Engineer**

### What They Do
- Connect frontend to database using Supabase client
- Implement real-time data subscriptions
- Optimize database queries for performance
- Handle data fetching, caching, and state management
- Implement CRUD operations from frontend

### Why They Do This
- Frontend needs efficient access to backend data
- Real-time features require subscription setup
- Proper data fetching prevents slow load times
- Caching reduces unnecessary database calls
- Good integration provides smooth user experience

### How They Do This
- Use Supabase JavaScript client library
- Implement React Query for data management
- Set up real-time channels for live updates
- Write efficient SQL queries via the client
- Handle loading states and errors gracefully

### Code Examples from Project

```typescript
// Database Query: Fetching Hotels
// File: src/pages/Hotels.tsx (excerpt)
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const { data: hotels, isLoading } = useQuery({
  queryKey: ["hotels", city],
  queryFn: async () => {
    let query = supabase
      .from("hotels")
      .select("*")
      .order("rating", { ascending: false });

    if (city) {
      query = query.eq("city", city);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
});
```

```typescript
// Database Mutation: Creating a Booking
// Example booking creation
import { useMutation, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

const createBookingMutation = useMutation({
  mutationFn: async (bookingData: {
    item_id: string;
    booking_type: string;
    item_name: string;
    total_price: number;
    check_in_date?: string;
    check_out_date?: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        ...bookingData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    // Invalidate and refetch bookings
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
    
    toast({
      title: "Success",
      description: "Booking created successfully!",
    });
  },
  onError: (error) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message,
    });
  },
});
```

```typescript
// Real-time Subscription: Listen to New Bookings
// Example real-time implementation
import { useEffect } from "react";

useEffect(() => {
  const channel = supabase
    .channel('bookings-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `user_id=eq.${user?.id}`
      },
      (payload) => {
        console.log('New booking created:', payload.new);
        // Update UI with new booking
        queryClient.invalidateQueries({ queryKey: ["bookings"] });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user?.id]);
```

```typescript
// Complex Query: Fetching User Profile with Bookings
const { data: userProfile } = useQuery({
  queryKey: ["profile", user?.id],
  queryFn: async () => {
    if (!user) return null;

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    // Fetch user's bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (bookingsError) throw bookingsError;

    return {
      ...profile,
      bookings,
    };
  },
  enabled: !!user,
});
```

```typescript
// Update Profile Data
const updateProfileMutation = useMutation({
  mutationFn: async (updates: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  },
});
```

---

## Team Collaboration Overview

### How These Roles Work Together

1. **Database Architect** creates the foundation → tables and schema
2. **Auth Engineer** builds on top → adds user management and security triggers
3. **Security Engineer** protects the data → implements RLS policies
4. **API Developer** extends functionality → creates backend business logic
5. **Integration Specialist** connects it all → makes data accessible to users

### Communication Between Members

```
User Action (Frontend)
    ↓
Integration Specialist (React Query + Supabase Client)
    ↓
Security Engineer (RLS Policies Check)
    ↓
Database Architect (Table Schema)
    ↓
Auth Engineer (User Verification)
    ↓
API Developer (Additional Business Logic if needed)
    ↓
Response back to User
```

### Project File Structure

```
project/
├── src/
│   ├── integrations/supabase/
│   │   ├── client.ts          # Integration Specialist
│   │   └── types.ts           # Database Architect
│   ├── components/
│   │   ├── AuthGuard.tsx      # Auth Engineer
│   │   └── Header.tsx         # Integration Specialist
│   └── pages/
│       ├── Hotels.tsx         # Integration Specialist
│       ├── Profile.tsx        # Integration Specialist
│       └── Auth.tsx           # Auth Engineer
├── supabase/
│   ├── migrations/            # Database Architect
│   ├── functions/             # API Developer
│   └── config.toml           # All Members
└── docs/
    └── backend-team-roles.md  # This Document
```

---

## Summary

Each team member has a critical role in building a secure, scalable, and efficient backend:

- **Member 1 (Database Architect)**: Designs the data structure
- **Member 2 (Auth Engineer)**: Manages users and authentication
- **Member 3 (API Developer)**: Builds server-side logic
- **Member 4 (Security Engineer)**: Protects the data
- **Member 5 (Integration Specialist)**: Connects frontend to backend

Together, they create a complete backend system powered by Lovable Cloud (Supabase), ensuring data security, user authentication, real-time capabilities, and seamless integration with the frontend.
