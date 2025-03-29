/*
  # Create articles and categories tables

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text)
      - `created_at` (timestamptz)
    
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `excerpt` (text)
      - `published` (boolean)
      - `author_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `keywords` (text[])
      - `category_id` (uuid, foreign key to categories)

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Public read access to published articles
      - Authors can manage their own articles
      - Authenticated users can manage categories
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  published boolean DEFAULT false,
  author_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  keywords text[] DEFAULT '{}',
  category_id uuid REFERENCES categories(id)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can manage categories"
  ON categories
  FOR ALL
  TO public
  USING (role() = 'authenticated')
  WITH CHECK (role() = 'authenticated');

-- Policies for articles
CREATE POLICY "Anyone can read published articles"
  ON articles
  FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Authors can manage their own articles"
  ON articles
  FOR ALL
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);