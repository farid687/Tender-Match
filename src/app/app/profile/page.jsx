'use client'

import { useState, useMemo, useCallback } from 'react'
import { Box } from '@chakra-ui/react'
import { Loading } from '@/elements/loading'
import { useGlobal } from '@/context'
import ProfileDetailHeader from './components/ProfileDetailHeader'
import ProfileTabs from './components/ProfileTabs'
import { computeProgress } from './variables'

export default function ProfilePage() {
  const { user, company, loading: authLoading, regions, cpvs: cpvsRaw } = useGlobal()
  const [draft, setDraft] = useState({})

  const cpvs = useMemo(
    () => (cpvsRaw || []).map((c) => ({ id: c.id, name: `${c.cpv_code || ''} - ${c.main_cpv_description || ''}`.trim() })),
    [cpvsRaw]
  )

  const onDraftChange = useCallback((partial) => {
    setDraft(prev => ({ ...prev, ...partial }))
  }, [])

  const progressPercentage = useMemo(() => {
    const data = company ? { ...company, ...draft } : draft
    return computeProgress(data)
  }, [company, draft])

  if (authLoading) {
    return <Loading fullScreen message="Loading profile data..." />
  }

  return (
    <Box
      minH={{ base: "90dvh", lg: "90vh" }}
      w="full"
      position="relative"
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
      overflowX="hidden"
      bg="white"
      px={{ base: "4", sm: "5", md: "6" }}
      py={{ base: "5", md: "6" }}
    >
      <Box w="full" position="relative" zIndex={1} minW={0}>
        <ProfileDetailHeader progressPercentage={progressPercentage} />
        <Box bg="white" borderRadius="2xl" overflow="visible" position="relative"  pb="0">
          <ProfileTabs
            company={company}
            regions={regions}
            cpvs={cpvs}
            companyId={user?.company_id}
            onDraftChange={onDraftChange}
          />
        </Box>
      </Box>
    </Box>
  )
}
