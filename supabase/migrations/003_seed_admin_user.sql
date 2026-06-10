-- Seed initial admin user (run after 001_schema.sql)
-- Only emails in admin_users can access the admin dashboard after Google OAuth
INSERT INTO admin_users (email) VALUES ('hilming.mn@gmail.com')
ON CONFLICT (email) DO NOTHING;
