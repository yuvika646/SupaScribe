-- SupaScribe Database Schema
-- Run this script in your Supabase SQL editor

-- Create ENUMS for Roles and Subscriptions
CREATE TYPE public.role AS ENUM ('ADMIN', 'MEMBER');
CREATE TYPE public.subscription AS ENUM ('FREE', 'PRO');

-- Create tenants table
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  subscription public.subscription DEFAULT 'FREE',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role public.role DEFAULT 'MEMBER',
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create notes table
CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX profiles_tenant_id_idx ON public.profiles(tenant_id);
CREATE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX notes_tenant_id_idx ON public.notes(tenant_id);
CREATE INDEX notes_author_id_idx ON public.notes(author_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Tenants: Users can only see their own tenant
CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Profiles: Users can view profiles in their tenant
CREATE POLICY "Users can view profiles in their tenant" ON public.profiles
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Notes: Users can only access notes in their tenant
CREATE POLICY "Users can view notes in their tenant" ON public.notes
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert notes in their tenant" ON public.notes
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
    AND author_id = auth.uid()
  );

CREATE POLICY "Users can update their own notes" ON public.notes
  FOR UPDATE USING (
    author_id = auth.uid()
    AND tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes in their tenant" ON public.notes
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;

-- Sample data (optional - for testing)
INSERT INTO public.tenants (id, name, slug, subscription) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Acme Corp', 'acme-corp', 'FREE'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'TechStart Inc', 'techstart-inc', 'PRO');

-- Note: You'll need to create actual auth users and then add their profiles
-- This can be done through your application's registration flow
