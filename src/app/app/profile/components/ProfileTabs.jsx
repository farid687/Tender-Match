'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Box } from '@chakra-ui/react'
import { LuBuilding2, LuClipboardList, LuFolderOpen, LuKey, LuUser } from 'react-icons/lu'
import { TabButton } from '@/elements/tab-button'
import PersonalProfileTab from './PersonalProfileTab'
import CompanyProfileTab from './CompanyProfileTab'
import CompanyDetailsTab from './CompanyDetailsTab'
import PortfolioTab from './PortfolioTab'
import ChangePasswordTab from './ChangePasswordTab'

export default function ProfileTabs({ company, regions, cpvs, companyId, onDraftChange }) {
  const [activeTab, setActiveTab] = useState('personal')
  const [visitedTabs, setVisitedTabs] = useState(() => new Set(['personal']))

  useEffect(() => {
    setVisitedTabs(prev => (prev.has(activeTab) ? prev : new Set([...prev, activeTab])))
  }, [activeTab])

  const onValueChange = useCallback((details) => setActiveTab(details.value), [])

  const tabs = useMemo(() => [
    { value: 'personal', label: 'Personal Profile', leftIcon: <Box as={LuUser} size={18} flexShrink={0} />, content: visitedTabs.has('personal') ? <PersonalProfileTab /> : null },
    { value: 'company-info', label: 'Company Profile', leftIcon: <Box as={LuBuilding2} size={18}  flexShrink={0} />, content: visitedTabs.has('company-info') ? <CompanyProfileTab company={company} regions={regions} cpvs={cpvs} onDraftChange={onDraftChange} /> : null },
    { value: 'company-details', label: 'Company Details', leftIcon: <Box as={LuClipboardList} size={18} flexShrink={0} />, content: visitedTabs.has('company-details') ? <CompanyDetailsTab company={company} companyId={companyId} onDraftChange={onDraftChange} /> : null },
    { value: 'portfolio', label: 'Portfolio', leftIcon: <Box as={LuFolderOpen} size={18}  flexShrink={0} />, content: visitedTabs.has('portfolio') ? <PortfolioTab companyId={companyId} /> : null },
    { value: 'change-password', label: 'Change Password', leftIcon: <Box as={LuKey} size={18} flexShrink={0} />, content: visitedTabs.has('change-password') ? <ChangePasswordTab /> : null },
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
