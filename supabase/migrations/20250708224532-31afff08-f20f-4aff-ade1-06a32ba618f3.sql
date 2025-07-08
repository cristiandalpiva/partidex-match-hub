-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('player', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('5', '8', '11')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_sub BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined')),
  UNIQUE(team_id, user_id)
);

-- Create fields table
CREATE TABLE public.fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'maybe' CHECK (status IN ('confirmed', 'maybe', 'no')),
  attended BOOLEAN DEFAULT NULL,
  UNIQUE(match_id, user_id)
);

-- Create scores table
CREATE TABLE public.scores (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  total_games INTEGER NOT NULL DEFAULT 0,
  attended INTEGER NOT NULL DEFAULT 0,
  paid INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 100 CHECK (score >= 0 AND score <= 100),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('qr', 'cash', 'transfer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'complete')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(match_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Teams policies
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Players can create teams" ON public.teams FOR INSERT WITH CHECK (public.get_current_user_role() = 'player');
CREATE POLICY "Team owners can update their teams" ON public.teams FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Team owners can delete their teams" ON public.teams FOR DELETE USING (auth.uid() = owner_id);

-- Team members policies
CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Team owners can manage members" ON public.team_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid())
);
CREATE POLICY "Users can manage their own membership" ON public.team_members FOR UPDATE USING (auth.uid() = user_id);

-- Fields policies
CREATE POLICY "Anyone can view fields" ON public.fields FOR SELECT USING (true);
CREATE POLICY "Admins can create fields" ON public.fields FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');
CREATE POLICY "Field admins can update their fields" ON public.fields FOR UPDATE USING (auth.uid() = admin_id);
CREATE POLICY "Field admins can delete their fields" ON public.fields FOR DELETE USING (auth.uid() = admin_id);

-- Matches policies
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Team owners can create matches" ON public.matches FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND owner_id = auth.uid())
);
CREATE POLICY "Match creators can update matches" ON public.matches FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Match creators can delete matches" ON public.matches FOR DELETE USING (auth.uid() = created_by);

-- Attendance policies
CREATE POLICY "Anyone can view attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Users can manage their own attendance" ON public.attendance FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Match creators can manage attendance" ON public.attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.matches WHERE id = match_id AND created_by = auth.uid())
);

-- Scores policies
CREATE POLICY "Anyone can view scores" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Users can view their own score" ON public.scores FOR SELECT USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Field admins can view payments for their matches" ON public.payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.matches m 
    JOIN public.fields f ON m.field_id = f.id 
    WHERE m.id = match_id AND f.admin_id = auth.uid()
  )
);
CREATE POLICY "Field admins can update payment status" ON public.payments FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.matches m 
    JOIN public.fields f ON m.field_id = f.id 
    WHERE m.id = match_id AND f.admin_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON public.scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'player')
  );
  
  INSERT INTO public.scores (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();