'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/hooks/useCompany'
import { Box } from '@chakra-ui/react'
import { Loading } from '@/elements/loading'
import { useGlobal } from '@/context'
import ProfileDetailHeader from './components/ProfileDetailHeader'
import ProfileTabs from './components/ProfileTabs'
import { CONTRACT_VALUE_MIN, CONTRACT_VALUE_MAX, parseCustomContractRange } from './variables'

export default function ProfilePage() {
  const { user, company, loading: authLoading } = useGlobal()
  const { getCompany } = useCompany()
  const [regions, setRegions] = useState([])
  const [cpvs, setCpvs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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

  const progressPercentage = useMemo(() => {
    if (!company) return 0
    let completed = 0
    const total = 6
    if (company.region?.trim()) completed++
    if (company.worker_size?.trim()) completed++
    if (Array.isArray(company.cpvs) && company.cpvs.length > 0) completed++
    if (Array.isArray(company.contract_type) && company.contract_type.length > 0) completed++
    const cr = company.contract_range != null ? (typeof company.contract_range === 'number' ? company.contract_range : parseCustomContractRange(company.contract_range)) : null
    if (cr != null && cr >= CONTRACT_VALUE_MIN && cr <= CONTRACT_VALUE_MAX) completed++
    if (Array.isArray(company.primary_goal) && company.primary_goal.length > 0) completed++
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }, [company])

  if (authLoading || isLoading) {
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
        <Box bg="white" borderRadius="2xl" overflow="visible" position="relative" pt={{ base: "4", md: "5" }} pb="0">
          <ProfileTabs
            company={company}
            regions={regions}
            cpvs={cpvs}
            companyId={user?.company_id}
          />
        </Box>
      </Box>
    </Box>
  )
}
