-- TheChoiceList Database Schema
-- Run in Supabase SQL Editor

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Posts
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    summary TEXT,
    image_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    affiliate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Admin whitelist (emails allowed to manage content)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE email = auth.jwt() ->> 'email'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Public read categories"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Admin manage categories"
    ON categories FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- Posts policies
CREATE POLICY "Public read published posts"
    ON posts FOR SELECT
    USING (status = 'published' OR is_admin());

CREATE POLICY "Admin manage posts"
    ON posts FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admin update posts"
    ON posts FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Admin delete posts"
    ON posts FOR DELETE
    USING (is_admin());

-- Admin users: only service role can manage
CREATE POLICY "Admin read own admin list"
    ON admin_users FOR SELECT
    USING (is_admin());

-- Seed categories
INSERT INTO categories (name, slug) VALUES
    ('Gadgets', 'gadgets'),
    ('Home & Living', 'home-living'),
    ('Fashion', 'fashion')
ON CONFLICT (slug) DO NOTHING;

-- Add your admin email after enabling Google OAuth:
-- INSERT INTO admin_users (email) VALUES ('your@gmail.com');
