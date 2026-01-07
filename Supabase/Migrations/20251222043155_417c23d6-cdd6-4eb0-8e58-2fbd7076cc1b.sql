-- ============================================
-- MIGRACIÓN ACTUALIZADA - ESQUEMA REAL
-- ============================================
-- Esta migración refleja el esquema real de la base de datos en Supabase
-- Orden de creación: primero users, luego las tablas que dependen de users
-- ============================================

-- Create users table (debe ser la primera porque otras tablas dependen de ella)
CREATE TABLE IF NOT EXISTS public.users (
  user_id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  password TEXT NOT NULL,
  passwordhash UUID NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  client_id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lead_source TEXT NOT NULL,
  priority TEXT DEFAULT NULL,
  last_contact TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (client_id),
  CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);

-- Create deals table
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT gen_random_uuid(),
  client_id UUID DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount NUMERIC NOT NULL DEFAULT 0,
  CONSTRAINT deals_pkey PRIMARY KEY (id),
  CONSTRAINT deals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT deals_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(client_id)
);

-- Create automations table
CREATE TABLE IF NOT EXISTS public.automations (
  automation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  action_type_type TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT automations_pkey PRIMARY KEY (automation_id),
  CONSTRAINT automations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);

-- Create automation_steps table
CREATE TABLE IF NOT EXISTS public.automation_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  step_order INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT automation_steps_pkey PRIMARY KEY (id),
  CONSTRAINT automation_steps_automation_id_fkey FOREIGN KEY (automation_id) REFERENCES public.automations(automation_id)
);

-- Create automation_runs table
CREATE TABLE IF NOT EXISTS public.automation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID DEFAULT gen_random_uuid(),
  automation_status TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT DEFAULT NULL,
  CONSTRAINT automation_runs_pkey PRIMARY KEY (id),
  CONSTRAINT automation_runs_automation_id_fkey FOREIGN KEY (automation_id) REFERENCES public.automations(automation_id),
  CONSTRAINT automation_runs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  due_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  CONSTRAINT reminders_pkey PRIMARY KEY (id),
  CONSTRAINT reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT reminders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(client_id)
);

-- Create interactions table
CREATE TABLE IF NOT EXISTS public.interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  ocurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  client_id UUID,
  direction TEXT NOT NULL,
  channel TEXT NOT NULL,
  sentiment TEXT DEFAULT NULL,
  CONSTRAINT interactions_pkey PRIMARY KEY (id),
  CONSTRAINT interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT interactions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(client_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can view their own users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own users" ON public.users;

DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;

DROP POLICY IF EXISTS "Users can view their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can create their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update their own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can delete their own deals" ON public.deals;

DROP POLICY IF EXISTS "Users can view their own automations" ON public.automations;
DROP POLICY IF EXISTS "Users can create their own automations" ON public.automations;
DROP POLICY IF EXISTS "Users can update their own automations" ON public.automations;
DROP POLICY IF EXISTS "Users can delete their own automations" ON public.automations;

DROP POLICY IF EXISTS "Users can view their own automation_steps" ON public.automation_steps;
DROP POLICY IF EXISTS "Users can create their own automation_steps" ON public.automation_steps;
DROP POLICY IF EXISTS "Users can update their own automation_steps" ON public.automation_steps;
DROP POLICY IF EXISTS "Users can delete their own automation_steps" ON public.automation_steps;

DROP POLICY IF EXISTS "Users can view their own automation_runs" ON public.automation_runs;
DROP POLICY IF EXISTS "Users can create their own automation_runs" ON public.automation_runs;
DROP POLICY IF EXISTS "Users can update their own automation_runs" ON public.automation_runs;
DROP POLICY IF EXISTS "Users can delete their own automation_runs" ON public.automation_runs;

DROP POLICY IF EXISTS "Users can view their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can create their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON public.reminders;

DROP POLICY IF EXISTS "Users can view their own interactions" ON public.interactions;
DROP POLICY IF EXISTS "Users can create their own interactions" ON public.interactions;
DROP POLICY IF EXISTS "Users can update their own interactions" ON public.interactions;
DROP POLICY IF EXISTS "Users can delete their own interactions" ON public.interactions;

-- RLS Policies for users
-- Note: Users table might need special handling depending on your auth setup
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for clients
CREATE POLICY "Users can view their own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for deals
CREATE POLICY "Users can view their own deals" ON public.deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own deals" ON public.deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deals" ON public.deals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own deals" ON public.deals FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for automations
CREATE POLICY "Users can view their own automations" ON public.automations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own automations" ON public.automations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own automations" ON public.automations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own automations" ON public.automations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for automation_steps
CREATE POLICY "Users can view their own automation_steps" ON public.automation_steps FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.automations WHERE automations.automation_id = automation_steps.automation_id AND automations.user_id = auth.uid()));
CREATE POLICY "Users can create their own automation_steps" ON public.automation_steps FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.automations WHERE automations.automation_id = automation_steps.automation_id AND automations.user_id = auth.uid()));
CREATE POLICY "Users can update their own automation_steps" ON public.automation_steps FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.automations WHERE automations.automation_id = automation_steps.automation_id AND automations.user_id = auth.uid()));
CREATE POLICY "Users can delete their own automation_steps" ON public.automation_steps FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.automations WHERE automations.automation_id = automation_steps.automation_id AND automations.user_id = auth.uid()));

-- RLS Policies for automation_runs
CREATE POLICY "Users can view their own automation_runs" ON public.automation_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own automation_runs" ON public.automation_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own automation_runs" ON public.automation_runs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own automation_runs" ON public.automation_runs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reminders
CREATE POLICY "Users can view their own reminders" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reminders" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reminders" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reminders" ON public.reminders FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for interactions
CREATE POLICY "Users can view their own interactions" ON public.interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own interactions" ON public.interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interactions" ON public.interactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interactions" ON public.interactions FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_automations_updated_at ON public.automations;
DROP TRIGGER IF EXISTS update_deals_updated_at ON public.deals;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_automations_updated_at 
  BEFORE UPDATE ON public.automations 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at 
  BEFORE UPDATE ON public.deals 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================
-- Esta migración refleja el esquema real de tu base de datos en Supabase
-- Tablas creadas:
--   1. users (tabla base)
--   2. clients (depende de users)
--   3. deals (depende de users y clients)
--   4. automations (depende de users)
--   5. automation_steps (depende de automations)
--   6. automation_runs (depende de automations y users)
--   7. reminders (depende de users y clients)
--   8. interactions (depende de users y clients)
-- ============================================
