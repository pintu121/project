/*
  # Create test history tables

  1. New Tables
    - `test_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `topic` (text)
      - `difficulty` (text)
      - `score` (numeric)
      - `questions_count` (integer)
      - `correct_answers` (integer)
      - `time_spent` (integer)
      - `strength_areas` (text[])
      - `improvement_areas` (text[])
      - `created_at` (timestamptz)
    
    - `test_questions`
      - `id` (uuid, primary key)
      - `test_id` (uuid, foreign key to test_history)
      - `question` (text)
      - `options` (text[])
      - `correct_answer` (integer)
      - `user_answer` (integer)
      - `explanation` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Insert their own test history
      - View their own test history
      - Insert questions for their tests
      - View questions for their tests
*/

-- Create test_history table
CREATE TABLE IF NOT EXISTS test_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  topic text NOT NULL,
  difficulty text NOT NULL,
  score numeric NOT NULL,
  questions_count integer NOT NULL,
  correct_answers integer NOT NULL,
  time_spent integer NOT NULL,
  strength_areas text[] DEFAULT '{}',
  improvement_areas text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create test_questions table
CREATE TABLE IF NOT EXISTS test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES test_history(id) ON DELETE CASCADE,
  question text NOT NULL,
  options text[] NOT NULL,
  correct_answer integer NOT NULL,
  user_answer integer,
  explanation text NOT NULL
);

-- Enable RLS
ALTER TABLE test_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;

-- Policies for test_history
CREATE POLICY "Users can insert own test history"
  ON test_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own test history"
  ON test_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for test_questions
CREATE POLICY "Users can insert own test questions"
  ON test_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM test_history
    WHERE test_history.id = test_questions.test_id
    AND test_history.user_id = auth.uid()
  ));

CREATE POLICY "Users can view own test questions"
  ON test_questions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM test_history
    WHERE test_history.id = test_questions.test_id
    AND test_history.user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_history_user_id ON test_history(user_id);
CREATE INDEX IF NOT EXISTS idx_test_history_topic ON test_history(topic);
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON test_questions(test_id);