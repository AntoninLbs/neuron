// src/app/api/generate-questions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import type { Difficulty, AnswerMode, GeneratedQuestion } from '@/types'

const DIFFICULTY_PROMPTS: Record<Difficulty, string> = {
  BEGINNER: 'niveau débutant (concepts de base, faits simples, vocabulaire courant)',
  INTERMEDIATE: 'niveau intermédiaire (nécessite des connaissances plus approfondies)',
  EXPERT: 'niveau expert (questions pointues, détails précis, subtilités)',
}

export async function POST(request: NextRequest) {
  try {
    const { categories, difficulty, answerMode = 'qcm', count = 10 } = await request.json() as {
      categories: string[]
      difficulty: Difficulty
      answerMode?: AnswerMode
      count?: number
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json({ error: 'Catégories requises' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key non configurée' }, { status: 500 })
    }

    // Import dynamique pour éviter l'erreur au build
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const questions: GeneratedQuestion[] = []
    const questionsPerCategory = Math.ceil(count / categories.length)

    for (const category of categories) {
      const numQuestions = Math.min(questionsPerCategory, count - questions.length)
      if (numQuestions <= 0) break

      const prompt = answerMode === 'qcm' 
        ? generateQCMPrompt(category, difficulty, numQuestions)
        : generateDirectPrompt(category, difficulty, numQuestions)

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu es un générateur de questions éducatives en français. Tu génères uniquement du JSON valide, sans texte supplémentaire.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 3000,
          response_format: { type: 'json_object' },
        })

        const content = response.choices[0]?.message?.content
        if (!content) continue

        const parsed = JSON.parse(content) as {
          questions: Array<{
            question: string
            answer: string
            choices?: string[]
            correctIndex?: number
            explanation: string
          }>
        }

        for (const q of parsed.questions) {
          // Validation de base
          if (!q.question || !q.answer) continue

          // Validation QCM spécifique
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

        // Petit délai pour éviter le rate limiting
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

function generateQCMPrompt(category: string, difficulty: Difficulty, count: number): string {
  return `Génère ${count} question(s) QCM sur le thème "${category}" de ${DIFFICULTY_PROMPTS[difficulty]}.

RÈGLES STRICTES :
1. Chaque question doit avoir UNE SEULE bonne réponse, sans ambiguïté
2. Exactement 4 choix de réponse plausibles mais distincts
3. L'explication doit être concise (2-3 phrases max) et éducative
4. Questions variées et intéressantes
5. Pas de questions d'actualité après 2024
6. Vocabulaire accessible

Réponds UNIQUEMENT avec ce JSON :
{
  "questions": [
    {
      "question": "La question complète ?",
      "answer": "La bonne réponse en texte",
      "choices": ["Choix A", "Choix B", "Choix C", "Choix D"],
      "correctIndex": 0,
      "explanation": "Explication courte de la bonne réponse."
    }
  ]
}

IMPORTANT : "correctIndex" correspond à l'index (0-3) de la bonne réponse dans "choices". "answer" doit être identique au choix correct.`
}

function generateDirectPrompt(category: string, difficulty: Difficulty, count: number): string {
  return `Génère ${count} question(s) à réponse directe sur le thème "${category}" de ${DIFFICULTY_PROMPTS[difficulty]}.

RÈGLES STRICTES :
1. La réponse doit être COURTE (1 à 5 mots maximum)
2. Une seule réponse possible, sans ambiguïté
3. Question claire et précise
4. L'explication doit être concise (2-3 phrases max)
5. Pas de questions d'actualité après 2024
6. Évite les réponses numériques complexes

Exemples de bonnes questions :
- "Quelle est la capitale de la France ?" → "Paris"
- "Qui a peint La Joconde ?" → "Léonard de Vinci"
- "Quel est le symbole chimique de l'or ?" → "Au"

Réponds UNIQUEMENT avec ce JSON :
{
  "questions": [
    {
      "question": "La question complète ?",
      "answer": "Réponse courte",
      "explanation": "Explication courte et éducative."
    }
  ]
}`
}
