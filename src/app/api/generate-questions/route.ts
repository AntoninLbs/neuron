// src/app/api/generate-questions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import type { CategoryKey, Difficulty, GeneratedQuestion } from '@/types'
import { CATEGORIES } from '@/types'

const DIFFICULTY_PROMPTS: Record<Difficulty, string> = {
  BEGINNER: 'niveau débutant (concepts de base, faits simples)',
  INTERMEDIATE: 'niveau intermédiaire (nécessite des connaissances plus approfondies)',
  EXPERT: 'niveau expert (questions pointues, détails précis)',
}

export async function POST(request: NextRequest) {
  try {
    const { categories, difficulty, count = 5 } = await request.json() as {
      categories: CategoryKey[]
      difficulty: Difficulty
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
      const categoryName = CATEGORIES[category]?.name || category
      const numQuestions = Math.min(questionsPerCategory, count - questions.length)
      
      if (numQuestions <= 0) break

      const prompt = `Tu es un générateur de questions éducatives pour une application d'apprentissage.

Génère ${numQuestions} question(s) sur le thème "${categoryName}" de ${DIFFICULTY_PROMPTS[difficulty]}.

Règles strictes:
1. Chaque question doit avoir UNE SEULE bonne réponse, sans ambiguïté
2. Propose exactement 4 choix de réponse plausibles mais distincts
3. L'explication doit être concise (2-3 phrases max) et éducative
4. Questions variées et intéressantes
5. Pas de questions d'actualité récente
6. Vocabulaire accessible

Réponds UNIQUEMENT avec un JSON valide dans ce format exact:
{
  "questions": [
    {
      "question": "La question ici ?",
      "choices": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
      "correctIndex": 0,
      "explanation": "Brève explication de la bonne réponse."
    }
  ]
}`

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu génères des questions de quiz éducatif en français. Réponds uniquement en JSON valide.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 2000,
          response_format: { type: 'json_object' },
        })

        const content = response.choices[0]?.message?.content
        if (!content) continue

        const parsed = JSON.parse(content) as {
          questions: Array<{
            question: string
            choices: string[]
            correctIndex: number
            explanation: string
          }>
        }

        for (const q of parsed.questions) {
          if (
            q.question &&
            Array.isArray(q.choices) &&
            q.choices.length === 4 &&
            typeof q.correctIndex === 'number' &&
            q.correctIndex >= 0 &&
            q.correctIndex <= 3
          ) {
            questions.push({
              question: q.question,
              choices: q.choices,
              correctIndex: q.correctIndex,
              explanation: q.explanation || '',
              category,
            })
          }
        }

        // Petit délai pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
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
