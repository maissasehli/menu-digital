import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import MenuClient from './MenuClient'

// ✅ Factory function — crée le client à la demande, pas au chargement du module
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Variables d\'environnement Supabase manquantes : ' +
      'NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies.'
    )
  }

  return createClient(url, key)
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // ✅ Client créé à l'intérieur de la fonction, jamais au top-level
  const supabase = getSupabase()

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