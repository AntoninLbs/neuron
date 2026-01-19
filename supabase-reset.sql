-- ============================================
-- NEURON v2 - RESET COMPLET + CRÉATION
-- Copie-colle TOUT dans Supabase SQL Editor
-- ============================================

-- 1. SUPPRIMER TOUT (dans le bon ordre à cause des foreign keys)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at();
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. CRÉER LES TABLES

-- Table des profils utilisateurs
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des projets
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'BEGINNER',
  answer_mode TEXT NOT NULL DEFAULT 'qcm',
  daily_limit INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des cartes (questions)
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  choices TEXT[],
  correct_index INTEGER,
  explanation TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed TIMESTAMPTZ,
  times_correct INTEGER DEFAULT 0,
  times_wrong INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des stats utilisateur
CREATE TABLE user_stats (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_reviews INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ACTIVER RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. POLICIES PROJECTS
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- 6. POLICIES CARDS
CREATE POLICY "Users can view cards of own projects" ON cards FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = cards.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can create cards in own projects" ON cards FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = cards.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update cards in own projects" ON cards FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = cards.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can delete cards in own projects" ON cards FOR DELETE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = cards.project_id AND projects.user_id = auth.uid())
);

-- 7. POLICIES USER_STATS
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. FONCTIONS
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO user_stats (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. TRIGGERS
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 10. INDEX
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_cards_project_id ON cards(project_id);
CREATE INDEX idx_cards_next_review ON cards(next_review);
CREATE INDEX idx_cards_status ON cards(status);

-- 11. CRÉER PROFIL POUR UTILISATEURS EXISTANTS (si tu es déjà connecté)
INSERT INTO profiles (id, display_name, avatar_url)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name'),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_stats (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;
