import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import MenuClient from './MenuClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: restaurant, error: restoError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!restaurant || restoError) notFound()

  const { data: categoriesRaw } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('position')

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .in(
      'category_id',
      (categoriesRaw ?? []).map((c) => c.id)
    )
    .eq('is_available', true)
    .order('position')

  return (
    <MenuClient
      restaurant={restaurant}
      categories={categoriesRaw ?? []}
      items={items ?? []}
    />
  )
}