'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { TabButton } from '@/elements/tab-button'
import CompanyProfileTab from './CompanyProfileTab'
import CompanyDetailsTab from './CompanyDetailsTab'
import PortfolioTab from './PortfolioTab'
import ChangePasswordTab from './ChangePasswordTab'

export default function ProfileTabs({ company, regions, cpvs, companyId }) {
  const [activeTab, setActiveTab] = useState('company-info')
  const [visitedTabs, setVisitedTabs] = useState(() => new Set(['company-info']))

  useEffect(() => {
    setVisitedTabs(prev => (prev.has(activeTab) ? prev : new Set([...prev, activeTab])))
  }, [activeTab])

  const onValueChange = useCallback((details) => setActiveTab(details.value), [])

  const tabs = useMemo(() => [
    { value: 'company-info', label: 'Company Profile', content: visitedTabs.has('company-info') ? <CompanyProfileTab company={company} regions={regions} cpvs={cpvs} /> : null },
    { value: 'company-details', label: 'Company Details', content: visitedTabs.has('company-details') ? <CompanyDetailsTab company={company} companyId={companyId} /> : null },
    { value: 'portfolio', label: 'Portfolio', content: visitedTabs.has('portfolio') ? <PortfolioTab companyId={companyId} /> : null },
    { value: 'change-password', label: 'Change Password', content: visitedTabs.has('change-password') ? <ChangePasswordTab /> : null },
  ], [visitedTabs, company, regions, cpvs, companyId])

  return (
    <TabButton
      variant="line"
      colorScheme="primary"
      size="md"
      tabs={tabs}
      value={activeTab}
      onValueChange={onValueChange}
    />
  )
}
