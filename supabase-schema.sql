-- ============================================
-- FRAGRANCE VAULT — SUPABASE SCHEMA
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FRAGRANCES (central database)
-- ============================================
CREATE TABLE fragrances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  concentration TEXT,
  release_year INTEGER,
  image_url TEXT,
  longevity INTEGER CHECK (longevity BETWEEN 1 AND 10),
  projection INTEGER CHECK (projection BETWEEN 1 AND 10),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FRAGRANCE NOTES
-- ============================================
CREATE TABLE fragrance_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fragrance_id UUID REFERENCES fragrances(id) ON DELETE CASCADE,
  note_name TEXT NOT NULL,
  note_type TEXT CHECK (note_type IN ('top', 'middle', 'base')) NOT NULL
);

-- ============================================
-- FRAGRANCE TAGS (seasons / occasions)
-- ============================================
CREATE TABLE fragrance_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fragrance_id UUID REFERENCES fragrances(id) ON DELETE CASCADE,
  season TEXT CHECK (season IN ('Spring', 'Summer', 'Autumn', 'Winter')),
  occasion TEXT CHECK (occasion IN ('Casual', 'Office', 'Formal', 'Date Night', 'Sport', 'Outdoor', 'Evening', 'Beach'))
);

-- ============================================
-- USER COLLECTIONS
-- ============================================
CREATE TABLE user_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fragrance_id UUID REFERENCES fragrances(id) ON DELETE CASCADE NOT NULL,
  ownership_type TEXT CHECK (ownership_type IN ('owned', 'wishlist', 'sampled')) DEFAULT 'owned',
  bottle_size NUMERIC,
  purchase_price NUMERIC,
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 10),
  favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, fragrance_id)
);

-- ============================================
-- WEAR LOGS
-- ============================================
CREATE TABLE wear_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fragrance_id UUID REFERENCES fragrances(id) ON DELETE CASCADE NOT NULL,
  worn_at TIMESTAMPTZ DEFAULT NOW(),
  occasion TEXT CHECK (occasion IN ('Casual', 'Office', 'Formal', 'Date Night', 'Sport', 'Outdoor', 'Evening', 'Beach')),
  weather TEXT CHECK (weather IN ('hot', 'warm', 'cool', 'cold', 'rainy', 'humid')),
  personal_notes TEXT
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Fragrances: public read, authenticated insert
ALTER TABLE fragrances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read fragrances" ON fragrances FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert fragrances" ON fragrances FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Fragrance notes: public read
ALTER TABLE fragrance_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read fragrance notes" ON fragrance_notes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert notes" ON fragrance_notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Fragrance tags: public read
ALTER TABLE fragrance_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read fragrance tags" ON fragrance_tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tags" ON fragrance_tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User collections: private per user
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own collection" ON user_collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collection" ON user_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collection" ON user_collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collection" ON user_collections FOR DELETE USING (auth.uid() = user_id);

-- Wear logs: private per user
ALTER TABLE wear_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own wear logs" ON wear_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wear logs" ON wear_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wear logs" ON wear_logs FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX idx_wear_logs_user_id ON wear_logs(user_id);
CREATE INDEX idx_wear_logs_worn_at ON wear_logs(worn_at DESC);
CREATE INDEX idx_fragrance_notes_fragrance_id ON fragrance_notes(fragrance_id);
CREATE INDEX idx_fragrance_tags_fragrance_id ON fragrance_tags(fragrance_id);
CREATE INDEX idx_fragrances_brand ON fragrances(brand);
