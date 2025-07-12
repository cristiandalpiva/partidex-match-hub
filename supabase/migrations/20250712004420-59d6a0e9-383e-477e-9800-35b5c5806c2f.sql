-- Add onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed boolean DEFAULT false,
ADD COLUMN onboarding_data jsonb DEFAULT '{}';

-- Update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;