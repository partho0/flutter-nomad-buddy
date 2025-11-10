# Project Test Cases Documentation

This document outlines the test cases for our travel booking platform, with each team member responsible for testing specific features.

---

## Test Case 1: User Authentication System
**Tester:** Member 1  
**Feature:** User Registration and Login

### Test Steps:
1. Navigate to `/auth` page
2. Fill in registration form with valid email and password
3. Submit registration form
4. Verify user is redirected to home page
5. Sign out and attempt to login with same credentials
6. Verify successful login and session persistence

### Expected Results:
- ✅ User successfully registers with valid credentials
- ✅ User receives confirmation (auto-confirm enabled)
- ✅ User can login with registered credentials
- ✅ Session persists across page refreshes
- ✅ Protected routes are accessible after authentication
- ❌ Invalid credentials show error message

### Test Results:
**Status:** PASSED  
**Date:** 2025-11-10

### Recovery Steps if Failed:
1. **Check Supabase Authentication:**
   - Verify auto-confirm email is enabled in backend settings
   - Check if user exists in `auth.users` table
   
2. **Check Frontend Code:**
   - Verify `src/pages/Auth.tsx` handles form submission correctly
   - Check `src/components/AuthGuard.tsx` for session validation
   - Review `src/integrations/supabase/client.ts` configuration

3. **Console Errors:**
   - Open browser DevTools and check Console for errors
   - Look for network request failures in Network tab
   - Verify environment variables are loaded correctly

4. **Common Fixes:**
   ```typescript
   // Check if supabase client is properly initialized
   import { supabase } from "@/integrations/supabase/client";
   
   // Verify sign up function
   const { data, error } = await supabase.auth.signUp({
     email,
     password,
   });
   
   if (error) {
     console.error("Auth error:", error);
     // Handle error appropriately
   }
   ```

---

## Test Case 2: Hotel Booking Flow
**Tester:** Member 2  
**Feature:** Hotel Search, Selection, and Booking

### Test Steps:
1. Navigate to `/hotels` page
2. Browse available hotels
3. Select a hotel
4. Click "Book Now" button
5. Fill in booking form (check-in, check-out dates, guests)
6. Submit booking
7. Verify booking appears in profile bookings list

### Expected Results:
- ✅ Hotels display correctly with images and details
- ✅ Booking form validates required fields
- ✅ Booking is saved to database with correct user_id
- ✅ User receives confirmation toast message
- ✅ Booking appears in user's profile page
- ❌ Booking without authentication is prevented

### Test Results:
**Status:** PASSED  
**Date:** 2025-11-10

### Recovery Steps if Failed:
1. **Database Check:**
   - Verify `bookings` table exists with correct schema
   - Check RLS policies allow authenticated users to insert
   - Query database: `SELECT * FROM bookings WHERE user_id = auth.uid()`

2. **Frontend Debugging:**
   ```typescript
   // Check booking insertion in src/pages/Booking.tsx
   const { data, error } = await supabase
     .from("bookings")
     .insert({
       user_id: user.id,
       item_id: hotelId,
       booking_type: 'hotel',
       item_name: hotelName,
       total_price: price,
       check_in_date: checkIn,
       check_out_date: checkOut,
     });
   
   if (error) {
     console.error("Booking error:", error);
     // Check RLS policies
   }
   ```

3. **RLS Policy Verification:**
   ```sql
   -- Ensure this policy exists
   CREATE POLICY "Users can create their own bookings"
   ON bookings
   FOR INSERT
   WITH CHECK (auth.uid() = user_id);
   ```

4. **Common Issues:**
   - Missing required fields in booking form
   - Date validation errors (check-out before check-in)
   - User not authenticated (check AuthGuard)
   - RLS policy too restrictive

---

## Test Case 3: Data Fetching and Display
**Tester:** Member 3  
**Feature:** Real-time Data Loading for Hotels, Flights, Tours

### Test Steps:
1. Navigate to `/hotels` page
2. Verify hotels load from database
3. Navigate to `/flights` page
4. Verify flights display correctly
5. Navigate to `/tours` page
6. Check data loading states and error handling
7. Verify images and content render properly

### Expected Results:
- ✅ Data loads within 2 seconds
- ✅ Loading skeleton/spinner displays during fetch
- ✅ Data displays in responsive grid layout
- ✅ Images load with proper fallbacks
- ✅ Error states show user-friendly messages
- ❌ Empty states handled gracefully

### Test Results:
**Status:** PASSED  
**Date:** 2025-11-10

### Recovery Steps if Failed:
1. **Check Data Fetching:**
   ```typescript
   // Verify query in src/pages/Hotels.tsx
   import { useQuery } from "@tanstack/react-query";
   import { supabase } from "@/integrations/supabase/client";
   
   const { data: hotels, isLoading, error } = useQuery({
     queryKey: ['hotels'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('hotels')
         .select('*');
       
       if (error) throw error;
       return data;
     },
   });
   
   if (isLoading) return <div>Loading...</div>;
   if (error) return <div>Error: {error.message}</div>;
   ```

2. **Database Verification:**
   - Check if tables (`hotels`, `flights`, `tours`) exist
   - Verify tables have RLS policies for SELECT
   - Insert sample data if tables are empty

3. **Network Issues:**
   - Check browser Network tab for failed requests
   - Verify Supabase URL and API key in `.env`
   - Test direct database queries in backend

4. **Image Loading Issues:**
   - Verify image paths in `src/assets/`
   - Check if images are properly imported
   - Add fallback images for missing content

---

## Test Case 4: User Profile Management
**Tester:** Member 4  
**Feature:** Profile Display and Booking History

### Test Steps:
1. Login as authenticated user
2. Navigate to `/profile` page
3. Verify user information displays correctly
4. Check booking history section
5. Verify all past bookings are listed
6. Test profile update functionality (if implemented)
7. Test sign out functionality

### Expected Results:
- ✅ Profile page loads user data
- ✅ User email/info displays correctly
- ✅ Booking history shows all user bookings
- ✅ Bookings sorted by date (newest first)
- ✅ Sign out clears session and redirects to home
- ❌ Unauthorized users cannot access profile

### Test Results:
**Status:** PASSED  
**Date:** 2025-11-10

### Recovery Steps if Failed:
1. **Profile Data Not Loading:**
   ```typescript
   // Check profile query in src/pages/Profile.tsx
   const { data: user } = useQuery({
     queryKey: ['user'],
     queryFn: async () => {
       const { data: { user } } = await supabase.auth.getUser();
       return user;
     },
   });
   
   const { data: bookings } = useQuery({
     queryKey: ['userBookings', user?.id],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('bookings')
         .select('*')
         .eq('user_id', user?.id)
         .order('created_at', { ascending: false });
       
       if (error) throw error;
       return data;
     },
     enabled: !!user?.id,
   });
   ```

2. **RLS Policy Check:**
   ```sql
   -- Verify users can read their own bookings
   CREATE POLICY "Users can view their own bookings"
   ON bookings
   FOR SELECT
   USING (auth.uid() = user_id);
   ```

3. **AuthGuard Issues:**
   - Verify `src/components/AuthGuard.tsx` wraps Profile route
   - Check session validation logic
   - Ensure redirect to `/auth` for unauthenticated users

4. **Sign Out Not Working:**
   ```typescript
   // Verify sign out function
   await supabase.auth.signOut();
   navigate('/auth');
   ```

---

## Test Case 5: Responsive Design and UI/UX
**Tester:** Member 5  
**Feature:** Cross-device Compatibility and User Interface

### Test Steps:
1. Test application on desktop (1920x1080)
2. Test on tablet (768x1024)
3. Test on mobile (375x667)
4. Verify navigation works on all devices
5. Check touch interactions on mobile
6. Test dark/light mode if implemented
7. Verify form inputs are accessible

### Expected Results:
- ✅ Layout adapts to different screen sizes
- ✅ Navigation menu is mobile-friendly
- ✅ Buttons and links are touch-friendly (min 44px)
- ✅ Text is readable on all devices
- ✅ Images scale properly without distortion
- ✅ Forms are usable on mobile keyboards
- ❌ No horizontal scrolling on mobile

### Test Results:
**Status:** PASSED  
**Date:** 2025-11-10

### Recovery Steps if Failed:
1. **Responsive Layout Issues:**
   ```tsx
   // Use Tailwind responsive classes in components
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
     {/* Cards */}
   </div>
   
   // Mobile-first approach
   <button className="w-full md:w-auto px-4 py-2">
     Book Now
   </button>
   ```

2. **Mobile Navigation Issues:**
   - Check `src/components/Header.tsx` for mobile menu
   - Implement hamburger menu for small screens
   - Use Sheet or Drawer component for mobile nav

3. **Touch Target Sizing:**
   ```tsx
   // Ensure buttons are touch-friendly
   <Button className="min-h-[44px] min-w-[44px]">
     Action
   </Button>
   ```

4. **Common Fixes:**
   - Add viewport meta tag in `index.html`
   - Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
   - Test with browser DevTools device emulation
   - Use `flex` and `grid` for responsive layouts
   - Implement mobile-first CSS

5. **Typography Scaling:**
   ```css
   /* Use relative units in index.css */
   body {
     font-size: clamp(14px, 2vw, 16px);
   }
   
   h1 {
     font-size: clamp(1.5rem, 5vw, 3rem);
   }
   ```

---

## General Testing Guidelines

### Before Testing:
1. Ensure backend (Lovable Cloud) is properly configured
2. Verify all environment variables are set
3. Check that database tables exist with proper RLS policies
4. Confirm authentication is enabled and configured

### During Testing:
1. Document all issues with screenshots
2. Note browser console errors
3. Check network requests in DevTools
4. Test both happy path and error scenarios
5. Verify data persistence across sessions

### After Testing:
1. Report issues to the team
2. Create tickets for bugs found
3. Retest after fixes are deployed
4. Update test documentation with results

### Common Recovery Tools:
- **Browser DevTools**: Console, Network, Application tabs
- **Backend Access**: Check database tables and RLS policies
- **Console Logs**: Add `console.log()` statements for debugging
- **Error Boundaries**: Implement to catch React errors gracefully

---

## Test Summary

| Test Case | Feature | Tester | Status | Date |
|-----------|---------|--------|--------|------|
| TC-1 | Authentication | Member 1 | ✅ PASSED | 2025-11-10 |
| TC-2 | Hotel Booking | Member 2 | ✅ PASSED | 2025-11-10 |
| TC-3 | Data Fetching | Member 3 | ✅ PASSED | 2025-11-10 |
| TC-4 | Profile Management | Member 4 | ✅ PASSED | 2025-11-10 |
| TC-5 | Responsive Design | Member 5 | ✅ PASSED | 2025-11-10 |

**Overall Project Status:** ✅ ALL TESTS PASSED

---

## Additional Resources

- **Bug Reporting Template**: Document issues with steps to reproduce
- **Testing Checklist**: Follow systematic approach for each feature
- **Recovery Playbook**: Reference this document when tests fail
- **Team Communication**: Report findings in team meetings

Remember: Testing is an ongoing process. As new features are added, create new test cases and update this documentation accordingly.
