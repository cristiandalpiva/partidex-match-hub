-- ============================================
-- CRITICAL SECURITY FIXES
-- ============================================

-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('player', 'admin');

-- 2. Create user_roles table (secure role storage)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
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

-- 4. Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::public.app_role
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Update get_current_user_role function to use new system
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::TEXT 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1
$$;

-- ============================================
-- RLS POLICIES - RESTRICT PUBLIC ACCESS
-- ============================================

-- Profiles: Restrict to authenticated users only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Teams: Restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;
CREATE POLICY "Authenticated users can view teams"
ON public.teams FOR SELECT
TO authenticated
USING (true);

-- Team Members: Restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view team members" ON public.team_members;
CREATE POLICY "Authenticated users can view team members"
ON public.team_members FOR SELECT
TO authenticated
USING (true);

-- Matches: Restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view matches" ON public.matches;
CREATE POLICY "Authenticated users can view matches"
ON public.matches FOR SELECT
TO authenticated
USING (true);

-- Attendance: Restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view attendance" ON public.attendance;
CREATE POLICY "Authenticated users can view attendance"
ON public.attendance FOR SELECT
TO authenticated
USING (true);

-- Scores: Users can only view their own score and admins can view all
DROP POLICY IF EXISTS "Anyone can view scores" ON public.scores;
DROP POLICY IF EXISTS "Users can view their own score" ON public.scores;

CREATE POLICY "Users can view their own score"
ON public.scores FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scores"
ON public.scores FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fields: Keep public but add better admin policies
DROP POLICY IF EXISTS "Admins can create fields" ON public.fields;
CREATE POLICY "Admins can create fields"
ON public.fields FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- UPDATE PROFILES TABLE
-- ============================================

-- Remove the role column from profiles (data already migrated)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Update profiles RLS to prevent users from modifying critical fields
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- USER_ROLES RLS POLICIES
-- ============================================

-- Only admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can assign roles (through triggers or admin functions only)
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- UPDATE TEAMS POLICIES WITH PROPER ROLE CHECK
-- ============================================

DROP POLICY IF EXISTS "Players can create teams" ON public.teams;
CREATE POLICY "Players can create teams"
ON public.teams FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'player'));