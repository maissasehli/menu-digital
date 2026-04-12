export type Restaurant = {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  primary_color: string
  country: string
  created_at: string
}

export type Category = {
  id: string
  restaurant_id: string
  name: string
  name_ar: string | null
  name_en: string | null
  position: number
  created_at: string
}

export type Item = {
  id: string
  category_id: string
  name: string
  name_ar: string | null
  name_en: string | null
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  position: number
  created_at: string
}
export type Review = {
  id: string
  restaurant_id: string
  rating: number           
  comment: string | null
  created_at: string
}