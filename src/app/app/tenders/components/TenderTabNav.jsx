'use client'

import { startTransition, useEffect } from 'react'
import { useSelectedLayoutSegment, useRouter } from 'next/navigation'
import { Box } from '@chakra-ui/react'
import { TabButton } from '@/elements/tab-button'

const TAB_ROUTES = [
  { value: 'ai-summary', label: 'AI Summary' },
  { value: 'detail', label: 'Details' },
  { value: 'organizations', label: 'Organizations' },
  { value: 'documents', label: 'Documents' },
  { value: 'qa', label: 'Q&A' },
  { value: 'announcements', label: 'Announcements' },
]

export default function TenderTabNav({ tenderId }) {
  const segment = useSelectedLayoutSegment() ?? 'ai-summary'
  const router = useRouter()
  const basePath = `/app/tenders/${tenderId}`
  const activeValue = TAB_ROUTES.some((t) => t.value === segment) ? segment : 'ai-summary'

  useEffect(() => {
    if (!tenderId) return
    const base = `/app/tenders/${tenderId}`
    TAB_ROUTES.forEach((tab) => {
      router.prefetch(`${base}/${tab.value}`)
    })
  }, [tenderId, router])

  const tabs = TAB_ROUTES.map((tab) => ({
    value: tab.value,
    label: tab.label,
    content: <Box display="none" />,
  }))

  const handleValueChange = (details) => {
    startTransition(() => {
      router.push(`${basePath}/${details.value}`)
    })
  }

  return (
    <TabButton
      variant="enclosed"
      size="md"
      tabs={tabs}
      value={activeValue}
      onValueChange={handleValueChange}
    />
  )
}
