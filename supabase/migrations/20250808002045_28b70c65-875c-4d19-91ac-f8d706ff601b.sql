
-- 1) Campos de canchas: separar ciudad/localidad y dirección
ALTER TABLE public.fields
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Backfill: mover el valor actual de location a address si address está vacío
UPDATE public.fields
SET address = COALESCE(address, location)
WHERE address IS NULL;

-- Índices para búsquedas por nombre y ciudad (case-insensitive)
CREATE INDEX IF NOT EXISTS fields_city_idx ON public.fields (LOWER(city));
CREATE INDEX IF NOT EXISTS fields_name_idx ON public.fields (LOWER(name));

-- 2) Notificaciones reales
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,               -- 'match_reminder' | 'team_update' | 'payment_confirmation' | 'payment_reminder' | 'general'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  priority TEXT NOT NULL DEFAULT 'low',  -- 'low' | 'medium' | 'high'
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: cada usuario ve/crea/actualiza sus propias notificaciones
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'Users can view their own notifications'
      AND polrelid = 'public.notifications'::regclass
  ) THEN
    CREATE POLICY "Users can view their own notifications"
      ON public.notifications
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'Users can create their own notifications'
      AND polrelid = 'public.notifications'::regclass
  ) THEN
    CREATE POLICY "Users can create their own notifications"
      ON public.notifications
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'Users can update their own notifications'
      AND polrelid = 'public.notifications'::regclass
  ) THEN
    CREATE POLICY "Users can update their own notifications"
      ON public.notifications
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger updated_at
DROP TRIGGER IF EXISTS set_notifications_updated_at ON public.notifications;
CREATE TRIGGER set_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Evitar duplicados de métodos de pago por usuario
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'unique_user_payment_method'
      AND conrelid = 'public.payment_methods'::regclass
  ) THEN
    ALTER TABLE public.payment_methods
      ADD CONSTRAINT unique_user_payment_method
      UNIQUE (user_id, stripe_payment_method_id);
  END IF;
END $$;

-- Asegurar trigger updated_at en payment_methods
DROP TRIGGER IF EXISTS set_payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER set_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
