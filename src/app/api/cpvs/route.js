import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const PAGE_SIZE = 1000

export async function GET() {
  let allCpvs = []
  let offset = 0
  let hasMore = true

  try {
    while (hasMore) {
      const { data, error } = await supabase
        .from('cpvs')
        .select('id, cpv_code, main_cpv_description')
        .range(offset, offset + PAGE_SIZE - 1)
        .order('cpv_code', { ascending: true })

      if (error) {
        console.error('Supabase CPVs fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      allCpvs = allCpvs.concat(data ?? [])
      hasMore = (data?.length ?? 0) === PAGE_SIZE
      offset += PAGE_SIZE
    }

    return NextResponse.json(allCpvs)
  } catch (err) {
    console.error('Fetch CPVs exception:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
