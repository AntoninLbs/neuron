// prisma/seed.ts
import { PrismaClient, Difficulty, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================
// THÈMES
// ============================================
const themes = [
  // Sciences
  { name: 'Physique', slug: 'physique', category: 'sciences', icon: '⚛️', color: '#3B82F6' },
  { name: 'Chimie', slug: 'chimie', category: 'sciences', icon: '🧪', color: '#8B5CF6' },
  { name: 'Biologie', slug: 'biologie', category: 'sciences', icon: '🧬', color: '#10B981' },
  { name: 'Astronomie', slug: 'astronomie', category: 'sciences', icon: '🌌', color: '#6366F1' },
  { name: 'Mathématiques', slug: 'mathematiques', category: 'sciences', icon: '📐', color: '#EC4899' },

  // Histoire
  { name: 'Histoire de France', slug: 'histoire-france', category: 'histoire', icon: '🇫🇷', color: '#EF4444' },
  { name: 'Histoire mondiale', slug: 'histoire-mondiale', category: 'histoire', icon: '🌍', color: '#F97316' },
  { name: 'Antiquité', slug: 'antiquite', category: 'histoire', icon: '🏛️', color: '#D97706' },
  { name: 'Moyen Âge', slug: 'moyen-age', category: 'histoire', icon: '⚔️', color: '#92400E' },
  { name: 'Histoire contemporaine', slug: 'histoire-contemporaine', category: 'histoire', icon: '📰', color: '#DC2626' },

  // Géographie
  { name: 'Capitales du monde', slug: 'capitales', category: 'geographie', icon: '🏙️', color: '#0EA5E9' },
  { name: 'Drapeaux', slug: 'drapeaux', category: 'geographie', icon: '🚩', color: '#14B8A6' },
  { name: 'Géographie physique', slug: 'geographie-physique', category: 'geographie', icon: '🏔️', color: '#059669' },
  { name: 'Océans et mers', slug: 'oceans', category: 'geographie', icon: '🌊', color: '#0284C7' },

  // Arts & Culture
  { name: 'Peinture', slug: 'peinture', category: 'arts', icon: '🎨', color: '#F59E0B' },
  { name: 'Musique classique', slug: 'musique-classique', category: 'arts', icon: '🎼', color: '#A855F7' },
  { name: 'Cinéma', slug: 'cinema', category: 'arts', icon: '🎬', color: '#EF4444' },
  { name: 'Littérature', slug: 'litterature', category: 'arts', icon: '📚', color: '#84CC16' },
  { name: 'Architecture', slug: 'architecture', category: 'arts', icon: '🏗️', color: '#64748B' },

  // Sport
  { name: 'Football', slug: 'football', category: 'sport', icon: '⚽', color: '#22C55E' },
  { name: 'Jeux Olympiques', slug: 'jo', category: 'sport', icon: '🏅', color: '#EAB308' },
  { name: 'Tennis', slug: 'tennis', category: 'sport', icon: '🎾', color: '#84CC16' },
  { name: 'Sports extrêmes', slug: 'sports-extremes', category: 'sport', icon: '🏄', color: '#06B6D4' },

  // Économie & Politique
  { name: 'Économie mondiale', slug: 'economie', category: 'economie', icon: '💹', color: '#10B981' },
  { name: 'Politique française', slug: 'politique-fr', category: 'economie', icon: '🗳️', color: '#3B82F6' },
  { name: 'Géopolitique', slug: 'geopolitique', category: 'economie', icon: '🌐', color: '#6366F1' },

  // Tech & Sciences
  { name: 'Informatique', slug: 'informatique', category: 'tech', icon: '💻', color: '#0EA5E9' },
  { name: 'Intelligence artificielle', slug: 'ia', category: 'tech', icon: '🤖', color: '#8B5CF6' },
  { name: 'Inventions', slug: 'inventions', category: 'tech', icon: '💡', color: '#FBBF24' },

  // Culture générale
  { name: 'Mythologie', slug: 'mythologie', category: 'culture', icon: '⚡', color: '#F97316' },
  { name: 'Gastronomie', slug: 'gastronomie', category: 'culture', icon: '🍽️', color: '#EF4444' },
  { name: 'Langues du monde', slug: 'langues', category: 'culture', icon: '🗣️', color: '#EC4899' },
]

// ============================================
// QUESTIONS DE FALLBACK
// ============================================
const fallbackQuestions = [
  // Histoire de France
  {
    themeSlug: 'histoire-france',
    question: 'En quelle année la Révolution française a-t-elle commencé ?',
    choices: ['1789', '1792', '1799', '1804'],
    correctIndex: 0,
    explanation: 'La Révolution française a débuté en 1789 avec la prise de la Bastille le 14 juillet.',
    difficulty: 'BEGINNER' as Difficulty,
  },
  {
    themeSlug: 'histoire-france',
    question: 'Qui était surnommé le "Roi Soleil" ?',
    choices: ['Louis XIV', 'Louis XVI', 'François Ier', 'Henri IV'],
    correctIndex: 0,
    explanation: 'Louis XIV a régné de 1643 à 1715 et a fait construire le château de Versailles.',
    difficulty: 'BEGINNER' as Difficulty,
  },
  {
    themeSlug: 'histoire-france',
    question: 'Quelle bataille Napoléon a-t-il perdue en 1815 ?',
    choices: ['Waterloo', 'Austerlitz', 'Iéna', 'Wagram'],
    correctIndex: 0,
    explanation: 'La bataille de Waterloo (18 juin 1815) marque la défaite finale de Napoléon.',
    difficulty: 'INTERMEDIATE' as Difficulty,
  },

  // Géographie - Capitales
  {
    themeSlug: 'capitales',
    question: 'Quelle est la capitale de l\'Australie ?',
    choices: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane'],
    correctIndex: 0,
    explanation: 'Canberra est la capitale depuis 1913, choisie comme compromis entre Sydney et Melbourne.',
    difficulty: 'INTERMEDIATE' as Difficulty,
  },
  {
    themeSlug: 'capitales',
    question: 'Quelle est la capitale du Canada ?',
    choices: ['Ottawa', 'Toronto', 'Montréal', 'Vancouver'],
    correctIndex: 0,
    explanation: 'Ottawa est la capitale du Canada depuis 1857.',
    difficulty: 'BEGINNER' as Difficulty,
  },
  {
    themeSlug: 'capitales',
    question: 'Quelle est la capitale de la Turquie ?',
    choices: ['Ankara', 'Istanbul', 'Izmir', 'Antalya'],
    correctIndex: 0,
    explanation: 'Ankara est devenue capitale en 1923 sous Atatürk, remplaçant Istanbul.',
    difficulty: 'INTERMEDIATE' as Difficulty,
  },

  // Sciences - Physique
  {
    themeSlug: 'physique',
    question: 'Quelle est la vitesse de la lumière dans le vide ?',
    choices: ['300 000 km/s', '150 000 km/s', '1 000 000 km/s', '30 000 km/s'],
    correctIndex: 0,
    explanation: 'La vitesse de la lumière est d\'environ 299 792 km/s, souvent arrondie à 300 000 km/s.',
    difficulty: 'BEGINNER' as Difficulty,
  },
  {
    themeSlug: 'physique',
    question: 'Qui a formulé la théorie de la relativité ?',
    choices: ['Albert Einstein', 'Isaac Newton', 'Niels Bohr', 'Max Planck'],
    correctIndex: 0,
    explanation: 'Einstein a publié la relativité restreinte en 1905 et la relativité générale en 1915.',
    difficulty: 'BEGINNER' as Difficulty,
  },

  // Astronomie
  {
    themeSlug: 'astronomie',
    question: 'Quelle est la planète la plus proche du Soleil ?',
    choices: ['Mercure', 'Vénus', 'Mars', 'Terre'],
    correctIndex: 0,
    explanation: 'Mercure orbite à environ 58 millions de km du Soleil.',
    difficulty: 'BEGINNER' as Difficulty,
  },
  {
    themeSlug: 'astronomie',
    question: 'Combien de lunes possède Mars ?',
    choices: ['2', '0', '1', '4'],
    correctIndex: 0,
    explanation: 'Mars possède deux petites lunes : Phobos et Deimos.',
    difficulty: 'INTERMEDIATE' as Difficulty,
  },

  // Cinéma
  {
    themeSlug: 'cinema',
    question: 'Quel film a remporté l\'Oscar du meilleur film en 1994 ?',
    choices: ['Forrest Gump', 'Pulp Fiction', 'Le Roi Lion', 'Léon'],
    correctIndex: 0,
    explanation: 'Forrest Gump de Robert Zemeckis a remporté 6 Oscars dont celui du meilleur film.',
    difficulty: 'INTERMEDIATE' as Difficulty,
  },
  {
    themeSlug: 'cinema',
    question: 'Qui a réalisé "Inception" (2010) ?',
    choices: ['Christopher Nolan', 'Steven Spielberg', 'Denis Villeneuve', 'Ridley Scott'],
    correctIndex: 0,
    explanation: 'Christopher Nolan a écrit et réalisé Inception avec Leonardo DiCaprio.',
    difficulty: 'BEGINNER' as Difficulty,
  },

  // Sport - Football
  {
    themeSlug: 'football',
    question: 'Quel pays a remporté la Coupe du Monde 2022 ?',
    choices: ['Argentine', 'France', 'Brésil', 'Croatie'],
    correctIndex: 0,
    explanation: 'L\'Argentine a battu la France aux tirs au but en finale au Qatar.',
    difficulty: 'BEGINNER' as Difficulty,
  },
  {
    themeSlug: 'football',
    question: 'Combien d\'étoiles la France a-t-elle sur son maillot ?',
    choices: ['2', '1', '3', '0'],
    correctIndex: 0,
    explanation: 'La France a remporté la Coupe du Monde en 1998 et 2018.',
    difficulty: 'BEGINNER' as Difficulty,
  },

  // Littérature
  {
    themeSlug: 'litterature',
    question: 'Qui a écrit "Les Misérables" ?',
    choices: ['Victor Hugo', 'Émile Zola', 'Honoré de Balzac', 'Gustave Flaubert'],
    correctIndex: 0,
    explanation: 'Victor Hugo a publié Les Misérables en 1862.',
    difficulty: 'BEGINNER' as Difficulty,
  },
  {
    themeSlug: 'litterature',
    question: 'Quel roman commence par "Longtemps, je me suis couché de bonne heure" ?',
    choices: ['Du côté de chez Swann', 'Madame Bovary', 'L\'Étranger', 'Le Rouge et le Noir'],
    correctIndex: 0,
    explanation: 'C\'est l\'incipit de "Du côté de chez Swann" de Marcel Proust (1913).',
    difficulty: 'EXPERT' as Difficulty,
  },

  // Économie
  {
    themeSlug: 'economie',
    question: 'Quelle est la monnaie du Japon ?',
    choices: ['Yen', 'Won', 'Yuan', 'Ringgit'],
    correctIndex: 0,
    explanation: 'Le yen (¥) est la monnaie japonaise depuis 1871.',
    difficulty: 'BEGINNER' as Difficulty,
  },

  // Informatique
  {
    themeSlug: 'informatique',
    question: 'En quelle année a été créé le World Wide Web ?',
    choices: ['1989', '1995', '1983', '1991'],
    correctIndex: 0,
    explanation: 'Tim Berners-Lee a inventé le Web au CERN en 1989.',
    difficulty: 'INTERMEDIATE' as Difficulty,
  },
  {
    themeSlug: 'informatique',
    question: 'Quel langage de programmation a été créé par Guido van Rossum ?',
    choices: ['Python', 'Java', 'JavaScript', 'Ruby'],
    correctIndex: 0,
    explanation: 'Guido van Rossum a créé Python en 1991.',
    difficulty: 'INTERMEDIATE' as Difficulty,
  },

  // Mythologie
  {
    themeSlug: 'mythologie',
    question: 'Dans la mythologie grecque, qui est le roi des dieux ?',
    choices: ['Zeus', 'Poséidon', 'Hadès', 'Apollon'],
    correctIndex: 0,
    explanation: 'Zeus règne sur l\'Olympe et contrôle la foudre.',
    difficulty: 'BEGINNER' as Difficulty,
  },
]

// ============================================
// BADGES
// ============================================
const badges = [
  // Streak badges
  { code: 'streak_3', name: 'Première flamme', description: '3 jours consécutifs', icon: '🔥', xpReward: 50, criteria: { type: 'streak', value: 3 } },
  { code: 'streak_7', name: 'Semaine parfaite', description: '7 jours consécutifs', icon: '🔥', xpReward: 100, criteria: { type: 'streak', value: 7 } },
  { code: 'streak_30', name: 'Mois en feu', description: '30 jours consécutifs', icon: '🔥', xpReward: 500, criteria: { type: 'streak', value: 30 } },
  { code: 'streak_100', name: 'Centenaire', description: '100 jours consécutifs', icon: '💯', xpReward: 2000, criteria: { type: 'streak', value: 100 } },
  { code: 'streak_365', name: 'Légende', description: '365 jours consécutifs', icon: '👑', xpReward: 10000, criteria: { type: 'streak', value: 365 } },

  // Answer badges
  { code: 'answers_10', name: 'Curieux', description: '10 réponses', icon: '🌱', xpReward: 20, criteria: { type: 'answers', value: 10 } },
  { code: 'answers_100', name: 'Apprenti', description: '100 réponses', icon: '📖', xpReward: 100, criteria: { type: 'answers', value: 100 } },
  { code: 'answers_500', name: 'Érudit', description: '500 réponses', icon: '🎓', xpReward: 500, criteria: { type: 'answers', value: 500 } },
  { code: 'answers_1000', name: 'Expert', description: '1000 réponses', icon: '🏆', xpReward: 1000, criteria: { type: 'answers', value: 1000 } },

  // Accuracy badges
  { code: 'perfect_day', name: 'Jour parfait', description: '100% de bonnes réponses en une journée', icon: '⭐', xpReward: 50, criteria: { type: 'perfect_day', value: 1 } },
  { code: 'perfect_week', name: 'Semaine parfaite', description: '7 jours parfaits consécutifs', icon: '🌟', xpReward: 500, criteria: { type: 'perfect_week', value: 1 } },

  // Project badges
  { code: 'first_project', name: 'Premier pas', description: 'Créer son premier projet', icon: '🚀', xpReward: 30, criteria: { type: 'projects', value: 1 } },
  { code: 'multi_project', name: 'Polyvalent', description: '3 projets actifs', icon: '📚', xpReward: 100, criteria: { type: 'projects', value: 3 } },

  // Mastery badges
  { code: 'master_10', name: 'Maîtrise', description: '10 cartes maîtrisées', icon: '✨', xpReward: 50, criteria: { type: 'mastered', value: 10 } },
  { code: 'master_100', name: 'Connaissance', description: '100 cartes maîtrisées', icon: '💎', xpReward: 300, criteria: { type: 'mastered', value: 100 } },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Seed themes
  console.log('📚 Creating themes...')
  for (const theme of themes) {
    await prisma.theme.upsert({
      where: { slug: theme.slug },
      update: theme,
      create: theme,
    })
  }
  console.log(`✅ ${themes.length} themes created`)

  // Seed fallback questions
  console.log('❓ Creating fallback questions...')
  for (const q of fallbackQuestions) {
    const theme = await prisma.theme.findUnique({ where: { slug: q.themeSlug } })
    if (!theme) {
      console.warn(`⚠️ Theme not found: ${q.themeSlug}`)
      continue
    }

    await prisma.question.create({
      data: {
        themeId: theme.id,
        question: q.question,
        choices: q.choices,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        difficulty: q.difficulty,
        type: 'MCQ' as QuestionType,
        isGenerated: false,
      },
    })
  }
  console.log(`✅ ${fallbackQuestions.length} fallback questions created`)

  // Seed badges
  console.log('🏅 Creating badges...')
  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge,
    })
  }
  console.log(`✅ ${badges.length} badges created`)

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
