-- ============================================
-- NEURON v3 - RESET COMPLET + CRÉATION
-- Système de jeu avec carte du monde, gems, mascotte
-- ============================================

-- 1. SUPPRIMER TOUT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at();
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS world_levels CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS user_purchases CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- 2. TABLES
-- ============================================

-- Profils utilisateurs
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  -- Gems & progression
  total_gems INTEGER DEFAULT 0,
  -- Streak
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  -- Mascotte personnalisation
  mascot_color TEXT DEFAULT '#f97316',
  mascot_accessory TEXT,
  -- Items débloqués (array de clés)
  unlocked_items TEXT[] DEFAULT '{}',
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projets
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  -- Niveau scolaire (par projet)
  school_level TEXT NOT NULL DEFAULT 'lycee',
  -- Difficulté adaptative (1-10)
  current_difficulty INTEGER NOT NULL DEFAULT 3,
  -- Mode réponse
  answer_mode TEXT NOT NULL DEFAULT 'qcm',
  -- Stats
  total_sessions INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_wrong INTEGER DEFAULT 0,
  consecutive_good_sessions INTEGER DEFAULT 0,
  -- Progression carte
  current_world INTEGER DEFAULT 1,
  current_level INTEGER DEFAULT 1,
  -- Timestamps
  last_session_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Niveaux de la carte du monde
CREATE TABLE world_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  world_number INTEGER NOT NULL,
  level_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_boss BOOLEAN DEFAULT FALSE,
  -- Progression
  is_unlocked BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  stars INTEGER DEFAULT 0 CHECK (stars >= 0 AND stars <= 3),
  best_score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  gems_reward INTEGER DEFAULT 30,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Unique constraint
  UNIQUE(project_id, world_number, level_number)
);

-- Cartes (questions)
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  level_id UUID REFERENCES world_levels(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  choices TEXT[],
  correct_index INTEGER,
  explanation TEXT,
  category TEXT NOT NULL,
  difficulty INTEGER DEFAULT 5,
  -- Spaced repetition
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

-- Achats utilisateur
CREATE TABLE user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_key)
);

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- World Levels
CREATE POLICY "Users can view levels of own projects" ON world_levels FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = world_levels.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can create levels in own projects" ON world_levels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = world_levels.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update levels in own projects" ON world_levels FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = world_levels.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can delete levels in own projects" ON world_levels FOR DELETE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = world_levels.project_id AND projects.user_id = auth.uid())
);

-- Cards
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

-- Purchases
CREATE POLICY "Users can view own purchases" ON user_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own purchases" ON user_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. FONCTIONS
-- ============================================

-- Créer profil automatiquement à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. TRIGGERS
-- ============================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 6. INDEX
-- ============================================

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_world_levels_project_id ON world_levels(project_id);
CREATE INDEX idx_cards_project_id ON cards(project_id);
CREATE INDEX idx_cards_level_id ON cards(level_id);
CREATE INDEX idx_cards_next_review ON cards(next_review);
CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_user_purchases_user_id ON user_purchases(user_id);

-- ============================================
-- 7. CRÉER PROFIL POUR UTILISATEURS EXISTANTS
-- ============================================

INSERT INTO profiles (id, display_name, avatar_url)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name'),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
