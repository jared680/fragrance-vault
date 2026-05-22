export type Concentration =
  | 'Parfum'
  | 'Eau de Parfum'
  | 'Eau de Toilette'
  | 'Eau de Cologne'
  | 'Eau Fraiche'
  | 'Other'

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter'

export type Occasion =
  | 'Casual'
  | 'Office'
  | 'Formal'
  | 'Date Night'
  | 'Sport'
  | 'Outdoor'
  | 'Evening'
  | 'Beach'

export type OwnershipType = 'owned' | 'wishlist' | 'sampled'

export type NoteType = 'top' | 'middle' | 'base'

export type WeatherType = 'hot' | 'warm' | 'cool' | 'cold' | 'rainy' | 'humid'

export interface Fragrance {
  id: string
  name: string
  brand: string
  concentration: Concentration | null
  release_year: number | null
  image_url: string | null
  longevity: number | null // 1-10
  projection: number | null // 1-10
  description: string | null
  created_at: string
}

export interface FragranceNote {
  id: string
  fragrance_id: string
  note_name: string
  note_type: NoteType
}

export interface FragranceTag {
  id: string
  fragrance_id: string
  season: Season | null
  occasion: Occasion | null
}

export interface UserCollection {
  id: string
  user_id: string
  fragrance_id: string
  ownership_type: OwnershipType
  bottle_size: number | null
  purchase_price: number | null
  user_rating: number | null // 1-10
  favorite: boolean
  created_at: string
  fragrance?: Fragrance & {
    fragrance_notes?: FragranceNote[]
    fragrance_tags?: FragranceTag[]
  }
}

export interface WearLog {
  id: string
  user_id: string
  fragrance_id: string
  worn_at: string
  occasion: Occasion | null
  weather: WeatherType | null
  personal_notes: string | null
  fragrance?: Fragrance
}

export interface WishlistItem {
  id: string
  user_id: string
  fragrance_id: string
  priority: number | null
  created_at: string
  fragrance?: Fragrance
}

export interface RecommendationInput {
  weather?: WeatherType
  occasion?: Occasion
  vibe?: string
}
