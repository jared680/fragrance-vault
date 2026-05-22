import { NextRequest, NextResponse } from 'next/server'
import type { UserCollection, WeatherType, Occasion } from '@/types'

interface RecommendRequest {
  collection: UserCollection[]
  weather: WeatherType | null
  occasion: Occasion | null
  vibe: string | null
}

// Rule-based scoring (no AI key needed for MVP)
function scoreFragrance(
  item: UserCollection,
  weather: WeatherType | null,
  occasion: Occasion | null,
  vibe: string | null
): number {
  let score = 0

  // Base: user rating
  score += (item.user_rating ?? 5) * 2

  // Bonus: favorite
  if (item.favorite) score += 5

  // Season/weather matching
  const tags = item.fragrance?.fragrance_tags ?? []
  const currentSeason = getSeason()

  tags.forEach(tag => {
    if (tag.season === currentSeason) score += 4
    if (tag.occasion && occasion && tag.occasion === occasion) score += 6
  })

  // Weather/note heuristics
  if (weather && item.fragrance?.fragrance_notes) {
    const notes = item.fragrance.fragrance_notes.map(n => n.note_name.toLowerCase())
    if (weather === 'hot' || weather === 'warm') {
      if (notes.some(n => ['citrus', 'aquatic', 'fresh', 'mint', 'bergamot', 'lemon'].some(k => n.includes(k)))) score += 3
    }
    if (weather === 'cold' || weather === 'cool') {
      if (notes.some(n => ['amber', 'oud', 'vanilla', 'musk', 'leather', 'sandalwood', 'tobacco'].some(k => n.includes(k)))) score += 3
    }
    if (weather === 'rainy') {
      if (notes.some(n => ['petrichor', 'earthy', 'woody', 'vetiver', 'cedar'].some(k => n.includes(k)))) score += 3
    }
  }

  // Vibe heuristics (basic)
  if (vibe && item.fragrance?.fragrance_notes) {
    const notes = item.fragrance.fragrance_notes.map(n => n.note_name.toLowerCase())
    const v = vibe.toLowerCase()
    if (v === 'cozy' && notes.some(n => ['vanilla', 'amber', 'tonka', 'caramel'].some(k => n.includes(k)))) score += 4
    if (v === 'fresh' && notes.some(n => ['citrus', 'aquatic', 'mint', 'green'].some(k => n.includes(k)))) score += 4
    if (v === 'seductive' && notes.some(n => ['oud', 'rose', 'amber', 'musk', 'jasmine'].some(k => n.includes(k)))) score += 4
    if (v === 'elegant' && notes.some(n => ['iris', 'rose', 'sandalwood', 'white musk'].some(k => n.includes(k)))) score += 4
    if (v === 'mysterious' && notes.some(n => ['oud', 'incense', 'smoke', 'leather', 'resin'].some(k => n.includes(k)))) score += 4
  }

  return score
}

function getSeason(): string {
  const month = new Date().getMonth() // 0-indexed
  // Southern hemisphere seasons
  if (month >= 2 && month <= 4) return 'Autumn'
  if (month >= 5 && month <= 7) return 'Winter'
  if (month >= 8 && month <= 10) return 'Spring'
  return 'Summer'
}

function getReasonText(
  item: UserCollection,
  weather: WeatherType | null,
  occasion: Occasion | null,
  vibe: string | null,
  season: string
): string {
  const reasons = []
  const tags = item.fragrance?.fragrance_tags ?? []

  if (tags.some(t => t.season === season)) reasons.push(`great for ${season.toLowerCase()}`)
  if (occasion && tags.some(t => t.occasion === occasion)) reasons.push(`suits ${occasion.toLowerCase()}`)
  if (item.favorite) reasons.push('one of your favourites')
  if (item.user_rating && item.user_rating >= 8) reasons.push(`you rated it ${item.user_rating}/10`)
  if (vibe) reasons.push(`matches your ${vibe.toLowerCase()} vibe`)

  if (reasons.length === 0) return 'A solid pick from your collection'
  return reasons.slice(0, 2).map((r, i) => i === 0 ? r.charAt(0).toUpperCase() + r.slice(1) : r).join(', ') + '.'
}

export async function POST(request: NextRequest) {
  try {
    const { collection, weather, occasion, vibe }: RecommendRequest = await request.json()

    if (!collection || collection.length === 0) {
      return NextResponse.json({ recommendations: [] })
    }

    const season = getSeason()

    const scored = collection
      .filter(item => item.ownership_type === 'owned')
      .map(item => ({
        fragrance: item,
        score: scoreFragrance(item, weather, occasion, vibe),
        reason: getReasonText(item, weather, occasion, vibe, season),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    // If API key is available, enhance with Claude
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey && scored.length > 0) {
      try {
        const fragranceList = scored.map((s, i) =>
          `${i + 1}. ${s.fragrance.fragrance?.brand} - ${s.fragrance.fragrance?.name}`
        ).join('\n')

        const prompt = `You are a fragrance expert. A user wants to wear a fragrance today.
Context: ${[weather && `Weather: ${weather}`, occasion && `Occasion: ${occasion}`, vibe && `Vibe: ${vibe}`].filter(Boolean).join(', ') || 'No specific context given'}
Current season (Southern Hemisphere): ${season}

From their personal collection, these fragrances scored highest:
${fragranceList}

For each fragrance, write ONE sentence (max 15 words) explaining why it suits the context. Be specific, confident, and elegant. Format as JSON array: [{"reason": "..."}]`

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 300,
            messages: [{ role: 'user', content: prompt }],
          }),
        })

        const aiData = await res.json()
        const text = aiData.content?.[0]?.text ?? ''
        const clean = text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)

        if (Array.isArray(parsed)) {
          parsed.forEach((p, i) => {
            if (scored[i] && p.reason) scored[i].reason = p.reason
          })
        }
      } catch {
        // AI enhancement failed — use rule-based reasons (already set)
      }
    }

    return NextResponse.json({ recommendations: scored })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
