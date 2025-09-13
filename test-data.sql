-- Add this after running the main database-schema.sql
-- This creates test data for development

-- First, create a tenant
INSERT INTO public.tenants (id, name, slug, subscription) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Test Company', 'test-company', 'FREE');

-- Note: You'll need to create a user through Supabase Auth first
-- Then link that user to the tenant by inserting into profiles table
-- Example (replace 'your-user-id' with actual user ID from auth.users):
-- INSERT INTO public.profiles (id, tenant_id, role, email) VALUES 
-- ('your-user-id', '550e8400-e29b-41d4-a716-446655440000', 'ADMIN', 'your-email@example.com');
