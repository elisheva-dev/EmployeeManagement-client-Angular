/*
  # Create roles table

  1. New Tables
    - `roles`
      - `id` (serial, primary key)
      - `title` (text, not null) - Role title in Hebrew

  2. Security
    - Enable RLS on `roles` table
    - Add policy for authenticated users to read roles
    - Add policy for authenticated users to insert roles

  3. Seed Data
    - Pre-populated with common employee roles in Hebrew
*/

CREATE TABLE IF NOT EXISTS roles (
  id serial PRIMARY KEY,
  title text NOT NULL
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read roles"
  ON roles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert roles"
  ON roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

INSERT INTO roles (title) VALUES
  ('מנהל'),
  ('מפתח'),
  ('מעצב'),
  ('בודק תוכנה'),
  ('מנתח מערכות'),
  ('מנהל פרויקט'),
  ('מנהל כספים'),
  ('מזכיר/ה'),
  ('מהנדס'),
  ('אחר');
