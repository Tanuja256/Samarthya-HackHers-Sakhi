-- ============================================================
-- Sakhi (सखी) — PCOS Screening & Support Platform
-- Database Schema for Supabase (Postgres)
-- Paste this into the Supabase SQL Editor to create all tables.
-- ============================================================

-- Users table: stores profile information collected during onboarding.
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL,           -- links to Supabase Auth user
  name TEXT NOT NULL,
  age INTEGER,
  location_type TEXT CHECK (location_type IN ('urban', 'semi-urban', 'rural')),
  preferred_lang TEXT DEFAULT 'en' CHECK (preferred_lang IN ('en', 'mr')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Screening responses: individual answers to the Rotterdam-informed checklist.
CREATE TABLE screening_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,             -- translation key for the question
  answer JSONB NOT NULL,                  -- flexible: boolean, scale, multi-select
  answered_at TIMESTAMPTZ DEFAULT now()
);

-- Risk scores: computed risk tier after a screening is completed.
CREATE TABLE risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL,            -- numerical score
  tier TEXT NOT NULL CHECK (tier IN ('low', 'moderate', 'high')),
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- Symptom logs: daily symptom entries (manual or parsed from voice).
CREATE TABLE symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symptom TEXT NOT NULL,                  -- e.g. 'acne', 'fatigue', 'hair_loss'
  severity INTEGER CHECK (severity BETWEEN 1 AND 5),
  notes TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'voice')),
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Cycle logs: menstrual cycle tracking entries.
CREATE TABLE cycle_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_start DATE NOT NULL,
  cycle_end DATE,
  flow_intensity TEXT CHECK (flow_intensity IN ('light', 'medium', 'heavy')),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Mood logs: daily mood / emotional state tracking.
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,                     -- e.g. 'happy', 'anxious', 'low'
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  sleep_hours NUMERIC(3,1),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Meal logs: what the family is cooking / what the user ate.
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'snack', 'dinner')),
  description TEXT NOT NULL,              -- free-text description of the meal
  tweaks TEXT,                            -- Gemini-suggested tweaks
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Diet plans: weekly meal plan cards using regional staples.
CREATE TABLE diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  plan_data JSONB NOT NULL,               -- structured weekly plan
  is_festival_mode BOOLEAN DEFAULT FALSE, -- true if generated for a festival
  festival_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lab reports: typed or photo-extracted lab values with plain-language explanations.
CREATE TABLE lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_date DATE,
  values JSONB NOT NULL,                  -- structured lab values
  explanation TEXT,                       -- Gemini-generated plain-language explanation
  doctor_questions TEXT[],                -- suggested questions for doctor visit
  source TEXT DEFAULT 'typed' CHECK (source IN ('typed', 'photo')),
  photo_storage_path TEXT,                -- Supabase Storage path if photo-extracted
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Report videos: AI-generated video summaries (script + TTS + captions).
CREATE TABLE report_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  related_report_id UUID REFERENCES lab_reports(id) ON DELETE SET NULL,
  related_risk_score_id UUID REFERENCES risk_scores(id) ON DELETE SET NULL,
  script TEXT NOT NULL,                   -- Gemini-generated narration script
  audio_storage_path TEXT,                -- TTS audio file in Supabase Storage
  captions JSONB,                         -- timed caption data for sync
  video_storage_path TEXT,                -- final composed video if applicable
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Photos: encrypted visual timeline entries (skin/hair progress).
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,             -- Supabase Storage path (access-controlled)
  category TEXT CHECK (category IN ('skin', 'hair', 'other')),
  notes TEXT,
  taken_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Community posts: anonymous, city-scoped community wall entries.
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  city TEXT,                              -- scoped to user's city
  body TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notification preferences: per-user settings for nudges and reminders.
CREATE TABLE notification_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  daily_reminder BOOLEAN DEFAULT TRUE,
  early_warning_nudges BOOLEAN DEFAULT TRUE,
  community_updates BOOLEAN DEFAULT FALSE,
  reminder_time TIME DEFAULT '09:00',
  updated_at TIMESTAMPTZ DEFAULT now()
);
