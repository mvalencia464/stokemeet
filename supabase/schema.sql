
-- Enable Row Level Security (RLS)
-- Create a table for user profiles/settings (e.g. Fathom API Key)
CREATE TABLE public."SM_user_settings" (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  fathom_api_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public."SM_user_settings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON public."SM_user_settings"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own settings" ON public."SM_user_settings"
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own settings" ON public."SM_user_settings"
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a table for meeting summaries
CREATE TABLE public."SM_summaries" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  meeting_id text NOT NULL, -- The Fathom Recording ID
  meeting_type text NOT NULL, -- 'general', 'sales', etc.
  content text,
  action_items jsonb, -- Store action items as JSON
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, meeting_id, meeting_type)
);

ALTER TABLE public."SM_summaries" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own summaries" ON public."SM_summaries"
  USING (auth.uid() = user_id);
