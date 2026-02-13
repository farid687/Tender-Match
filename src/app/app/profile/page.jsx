'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/hooks/useCompany'
import { Box } from '@chakra-ui/react'
import { Loading } from '@/elements/loading'
import { useGlobal } from '@/context'
import ProfileDetailHeader from './components/ProfileDetailHeader'
import ProfileTabs from './components/ProfileTabs'
import { computeProgress } from './variables'

export default function ProfilePage() {
  const { user, company, loading: authLoading } = useGlobal()
  const { getCompany, loading: companyLoading } = useCompany()
  const [regions, setRegions] = useState([])
  const [cpvs, setCpvs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [draft, setDraft] = useState({})

  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        const [regionsRes, cpvsRes] = await Promise.all([
          supabase.from('regions').select('id, name').order('name', { ascending: true }),
          supabase.from('cpvs').select('id, cpv_code, main_cpv_description').order('cpv_code', { ascending: true }),
        ])
        if (cancelled) return
        setRegions((regionsRes.data || []).map((r) => ({ id: r.id, name: r.name })))
        setCpvs((cpvsRes.data || []).map(cpv => ({ id: cpv.id, name: `${cpv.cpv_code} - ${cpv.main_cpv_description || ''}` })))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    loadInitialData()
    return () => { cancelled = true }
  }, [supabase])

  useEffect(() => {
    if (!supabase || !user?.company_id) return
    getCompany(user.company_id)
  }, [user?.company_id, getCompany])

  const onDraftChange = useCallback((partial) => {
    setDraft(prev => ({ ...prev, ...partial }))
  }, [])

  const progressPercentage = useMemo(() => {
    const data = company ? { ...company, ...draft } : draft
    return computeProgress(data)
  }, [company, draft])

  if (authLoading || isLoading || companyLoading) {
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
