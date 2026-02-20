'use client'

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { Box, Spinner } from '@chakra-ui/react'
import { LuBuilding2, LuClipboardList, LuFolderOpen, LuKey, LuUser } from 'react-icons/lu'
import { TabButton } from '@/elements/tab-button'

const PersonalProfileTab = lazy(() => import('./PersonalProfileTab'))
const CompanyProfileTab = lazy(() => import('./CompanyProfileTab'))
const CompanyDetailsTab = lazy(() => import('./CompanyDetailsTab'))
const PortfolioTab = lazy(() => import('./PortfolioTab'))
const ChangePasswordTab = lazy(() => import('./ChangePasswordTab'))

const TabFallback = () => (
  <Box py={8} display="flex" justifyContent="center" alignItems="center" minH="120px">
    <Spinner size="md" />
  </Box>
)

export default function ProfileTabs({ company, regions, cpvs, companyId, onDraftChange }) {
  const [activeTab, setActiveTab] = useState('personal')
  const [visitedTabs, setVisitedTabs] = useState(() => new Set(['personal']))

  useEffect(() => {
    setVisitedTabs(prev => (prev.has(activeTab) ? prev : new Set([...prev, activeTab])))
  }, [activeTab])

  const onValueChange = useCallback((details) => setActiveTab(details.value), [])

  const tabs = useMemo(() => [
    { value: 'personal', label: 'Personal Profile', leftIcon: <Box as={LuUser} size={18} flexShrink={0} />, content: visitedTabs.has('personal') ? <Suspense fallback={<TabFallback />}><PersonalProfileTab /></Suspense> : null },
    { value: 'company-info', label: 'Company Profile', leftIcon: <Box as={LuBuilding2} size={18} flexShrink={0} />, content: visitedTabs.has('company-info') ? <Suspense fallback={<TabFallback />}><CompanyProfileTab company={company} regions={regions} cpvs={cpvs} onDraftChange={onDraftChange} /></Suspense> : null },
    { value: 'company-details', label: 'Company Details', leftIcon: <Box as={LuClipboardList} size={18} flexShrink={0} />, content: visitedTabs.has('company-details') ? <Suspense fallback={<TabFallback />}><CompanyDetailsTab company={company} companyId={companyId} onDraftChange={onDraftChange} /></Suspense> : null },
    { value: 'portfolio', label: 'Portfolio', leftIcon: <Box as={LuFolderOpen} size={18} flexShrink={0} />, content: visitedTabs.has('portfolio') ? <Suspense fallback={<TabFallback />}><PortfolioTab companyId={companyId} /></Suspense> : null },
    { value: 'change-password', label: 'Change Password', leftIcon: <Box as={LuKey} size={18} flexShrink={0} />, content: visitedTabs.has('change-password') ? <Suspense fallback={<TabFallback />}><ChangePasswordTab /></Suspense> : null },
  ], [visitedTabs, company, regions, cpvs, companyId, onDraftChange])

  return (
    <TabButton
      fitted
      variant="enclosed"
      colorScheme="primary"
      size="lg"
      tabs={tabs}
      value={activeTab}
      onValueChange={onValueChange}
    />
  )
}
