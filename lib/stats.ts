import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getHomeStats() {
  const [
    { count: restaurantCount },
    { data: countries },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true }),

    supabase
      .from('restaurants')
      .select('country'),

    supabase
      .from('reviews')
      .select('rating'),
  ])

  const countryCount = new Set(
    countries?.map((r: { country: string }) => r.country)
  ).size

  const satisfaction =
    reviews && reviews.length > 0
      ? Math.round(
          (reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
            reviews.length /
            5) *
            100
        )
      : 0

  return {
    restaurantCount: restaurantCount ?? 0,
    countryCount,
    satisfaction,
  }
}