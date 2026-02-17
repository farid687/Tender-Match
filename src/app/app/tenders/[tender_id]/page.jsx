'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TenderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tenderId = params?.tender_id ?? null

  useEffect(() => {
    if (!tenderId) return
    router.replace(`/app/tenders/${tenderId}/ai-summary`)
  }, [tenderId, router])

  return null
}
