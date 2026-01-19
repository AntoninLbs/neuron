// src/app/api/generate-questions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import type { SchoolLevel, AnswerMode } from '@/types'

const SCHOOL_LEVEL_PROMPTS: Record<SchoolLevel, string> = {
  college: 'niveau collège (6ème-3ème), vocabulaire simple et accessible, concepts de base',
  lycee: 'niveau lycée (2nde-1ère), concepts intermédiaires, vocabulaire courant',
  terminale: 'niveau terminale/bac, approfondissement, questions de révision',
  superieur: 'niveau études supérieures (licence/master), concepts avancés, précision technique',
  expert: 'niveau expert/doctorat, questions pointues, détails précis, nuances',
}

const DIFFICULTY_PROMPTS: Record<number, string> = {
  1: 'très facile, questions basiques',
  2: 'facile, concepts simples',
  3: 'facile+, légèrement plus poussé',
  4: 'moyen-facile',
  5: 'moyen, niveau standard',
  6: 'moyen+, un peu plus difficile',
  7: 'difficile-, nécessite de bonnes connaissances',
  8: 'difficile, questions approfondies',
  9: 'très difficile, questions pointues',
  10: 'expert, questions de spécialiste',
}

export async function POST(request: NextRequest) {
  try {
    const { 
      categories, 
      schoolLevel = 'lycee',
      difficulty = 5, 
      answerMode = 'qcm', 
      count = 10 
    } = await request.json() as {
      categories: string[]
      schoolLevel?: SchoolLevel
      difficulty?: number
      answerMode?: AnswerMode
      count?: number
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json({ error: 'Catégories requises' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key non configurée' }, { status: 500 })
    }

    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const questions: any[] = []
    const questionsPerCategory = Math.ceil(count / categories.length)

    for (const category of categories) {
      const numQuestions = Math.min(questionsPerCategory, count - questions.length)
      if (numQuestions <= 0) break

      const prompt = answerMode === 'qcm' 
        ? generateQCMPrompt(category, schoolLevel, difficulty, numQuestions)
        : generateDirectPrompt(category, schoolLevel, difficulty, numQuestions)

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu es un professeur qui crée des questions éducatives en français. Tu génères uniquement du JSON valide.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 3000,
          response_format: { type: 'json_object' },
        })

        const content = response.choices[0]?.message?.content
        if (!content) continue

        const parsed = JSON.parse(content)

        for (const q of parsed.questions || []) {
          if (!q.question || !q.answer) continue

          if (answerMode === 'qcm') {
            if (!Array.isArray(q.choices) || q.choices.length !== 4) continue
            if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) continue
          }

          questions.push({
            question: q.question,
            answer: q.answer,
            choices: answerMode === 'qcm' ? q.choices : undefined,
            correctIndex: answerMode === 'qcm' ? q.correctIndex : undefined,
            explanation: q.explanation || '',
            category,
          })
        }

        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`Erreur génération pour ${category}:`, error)
      }
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Erreur API generate-questions:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 })
  }
}

function generateQCMPrompt(category: string, schoolLevel: SchoolLevel, difficulty: number, count: number): string {
  const levelDesc = SCHOOL_LEVEL_PROMPTS[schoolLevel]
  const diffDesc = DIFFICULTY_PROMPTS[Math.min(Math.max(difficulty, 1), 10)]

  return `Génère ${count} question(s) QCM sur "${category}".

NIVEAU : ${levelDesc}
DIFFICULTÉ : ${diffDesc}

RÈGLES :
1. Exactement 4 choix de réponse plausibles
2. UNE SEULE bonne réponse, sans ambiguïté
3. Explication courte et pédagogique (2-3 phrases)
4. Questions adaptées au niveau indiqué
5. Pas de questions d'actualité après 2024

Réponds UNIQUEMENT avec ce JSON :
{
  "questions": [
    {
      "question": "La question ?",
      "answer": "La bonne réponse",
      "choices": ["Choix A", "Choix B", "Choix C", "Choix D"],
      "correctIndex": 0,
      "explanation": "Explication pédagogique."
    }
  ]
}

IMPORTANT : "correctIndex" = index (0-3) de la bonne réponse dans "choices". "answer" = texte du choix correct.`
}

function generateDirectPrompt(category: string, schoolLevel: SchoolLevel, difficulty: number, count: number): string {
  const levelDesc = SCHOOL_LEVEL_PROMPTS[schoolLevel]
  const diffDesc = DIFFICULTY_PROMPTS[Math.min(Math.max(difficulty, 1), 10)]

  return `Génère ${count} question(s) à réponse directe sur "${category}".

NIVEAU : ${levelDesc}
DIFFICULTÉ : ${diffDesc}

RÈGLES :
1. Réponse COURTE (1 à 5 mots max)
2. Une seule réponse possible
3. Question claire et précise
4. Explication courte et pédagogique
5. Pas de questions d'actualité après 2024

Exemples :
- "Quelle est la capitale de la France ?" → "Paris"
- "Qui a peint La Joconde ?" → "Léonard de Vinci"

Réponds UNIQUEMENT avec ce JSON :
{
  "questions": [
    {
      "question": "La question ?",
      "answer": "Réponse courte",
      "explanation": "Explication pédagogique."
    }
  ]
}`
}
