// src/lib/openai.ts
import OpenAI from 'openai'
import type { GeneratedQuestion, Difficulty } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const DIFFICULTY_PROMPTS: Record<Difficulty, string> = {
  BEGINNER: 'niveau débutant (culture générale de base, faits connus)',
  INTERMEDIATE: 'niveau intermédiaire (nécessite des connaissances plus poussées)',
  EXPERT: 'niveau expert (questions pointues, détails précis)',
}

/**
 * Génère une question de culture générale via OpenAI
 */
export async function generateQuestion(
  themeName: string,
  themeSlug: string,
  difficulty: Difficulty,
  excludeQuestions: string[] = []
): Promise<GeneratedQuestion | null> {
  const excludeContext = excludeQuestions.length > 0
    ? `\n\nÉvite ces sujets déjà posés:\n${excludeQuestions.slice(0, 5).join('\n')}`
    : ''

  const prompt = `Tu es un générateur de questions de culture générale pour une application d'apprentissage.

Génère UNE question de culture générale sur le thème "${themeName}" de ${DIFFICULTY_PROMPTS[difficulty]}.

Règles strictes:
1. La question doit avoir UNE SEULE bonne réponse, sans ambiguïté
2. Les 4 choix de réponse doivent être plausibles mais distincts
3. L'explication doit être concise (1-2 phrases max)
4. Pas de questions d'actualité récente (après 2023)
5. Vocabulaire accessible, pas de jargon technique inutile
6. Pas de contenu sensible (politique controversée, religion, etc.)
${excludeContext}

Réponds UNIQUEMENT avec un JSON valide dans ce format exact:
{
  "question": "La question ici ?",
  "choices": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
  "correctIndex": 0,
  "explanation": "Brève explication de la bonne réponse."
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Tu génères des questions de quiz éducatif. Réponds uniquement en JSON valide.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.error('OpenAI: No content in response')
      return null
    }

    const parsed = JSON.parse(content) as {
      question: string
      choices: string[]
      correctIndex: number
      explanation: string
    }

    // Validation
    if (
      !parsed.question ||
      !Array.isArray(parsed.choices) ||
      parsed.choices.length !== 4 ||
      typeof parsed.correctIndex !== 'number' ||
      parsed.correctIndex < 0 ||
      parsed.correctIndex > 3 ||
      !parsed.explanation
    ) {
      console.error('OpenAI: Invalid response format', parsed)
      return null
    }

    return {
      question: parsed.question,
      choices: parsed.choices,
      correctIndex: parsed.correctIndex,
      explanation: parsed.explanation,
      themeSlug,
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    return null
  }
}

/**
 * Génère plusieurs questions en batch
 */
export async function generateQuestions(
  themes: { name: string; slug: string }[],
  difficulty: Difficulty,
  count: number = 5,
  excludeQuestions: string[] = []
): Promise<GeneratedQuestion[]> {
  const questions: GeneratedQuestion[] = []
  
  // Répartir les questions entre les thèmes
  const questionsPerTheme = Math.ceil(count / themes.length)
  
  for (const theme of themes) {
    const themeQuestions = Math.min(
      questionsPerTheme,
      count - questions.length
    )
    
    for (let i = 0; i < themeQuestions && questions.length < count; i++) {
      const question = await generateQuestion(
        theme.name,
        theme.slug,
        difficulty,
        [...excludeQuestions, ...questions.map(q => q.question)]
      )
      
      if (question) {
        questions.push(question)
      }
      
      // Petit délai pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  return questions
}

/**
 * Vérifie si l'API OpenAI est disponible
 */
export async function checkOpenAIAvailability(): Promise<boolean> {
  try {
    const response = await openai.models.list()
    return response.data.length > 0
  } catch {
    return false
  }
}
