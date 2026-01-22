'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/auth/context/auth-context'
import { useCompany } from '@/hooks/useCompany'
import { toaster } from '@/elements/toaster'
import { Button } from '@/elements/button'
import { IconButton } from '@/elements/icon-button'
import { InputField } from '@/elements/input'
import { SelectField } from '@/elements/select'
import { MultiSelectField } from '@/elements/multi-select'
import { SliderField } from '@/elements/slider'
import { Toggle } from '@/elements/toggle'
import { Collapsible } from '@/elements/collapsible'
import { TabButton } from '@/elements/tab-button'
import { Box, Text } from '@chakra-ui/react'
import { LuBuilding2, LuGlobe, LuUserRound, LuBriefcase, LuPlus, LuTrash2, LuSave, LuSettings } from 'react-icons/lu'
import { clientTypes, contractTypes, contractRangeLabels, valueBandLabels, MAX_PORTFOLIOS, primaryGoalOptions } from '../onboarding/variables'
import { Loading, LoadingOverlay } from '@/elements/loading'

export default function ProfilePage() {
  const { user, company, loading: authLoading } = useAuth()
  const { getCompany } = useCompany()
  const [activeTab, setActiveTab] = useState('company-info')
  const [certifications, setCertifications] = useState([])
  const [regions, setRegions] = useState([])
  const [cpvs, setCpvs] = useState([])
  const [openPortfolioIndex, setOpenPortfolioIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    // Step 1: Company Information
    region: '',
    region_interest: [],
    workerSize: '',
    kvk_number: '',
    company_website: '',
    cpvs: [],
    contract_type: [],
    contract_range: '0–50k',

    // Step 2: Company Details
    certification: [],
    primary_goal: [],
    uea_ready: false,
    match_ready: false,
  })

  // Separate state for portfolios
  const [portfolios, setPortfolios] = useState([
    {  
      title: '',
      client_type: '',
      year: '',
      value_band: '0–50k',
      description: '',
      cpvs: [],
    }
  ])

  // Validation errors state
  const [errors, setErrors] = useState({})
  const [portfolioErrors, setPortfolioErrors] = useState({})

  // Fetch certifications from Supabase
  const fetchCertifications = async () => {
    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('id, name')
        .order('name', { ascending: true })
      
      if (error) {
        console.error('Error fetching certifications:', error)
        setCertifications([])
      } else {
        const mappedCertifications = (data || []).map(cert => ({
          id: cert.id,
          name: cert.name
        }))
        setCertifications(mappedCertifications)
      }
    } catch (error) {
      console.error('Exception fetching certifications:', error)
      setCertifications([])
    }
  }

  // Fetch regions from Supabase
  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('id, name')
        .order('name', { ascending: true })
      
      if (error) {
        console.error('Error fetching regions:', error)
        setRegions([])
      } else {
        const mappedRegions = (data || []).map(region => ({
          id: region.id,
          name: region.name
        }))
        setRegions(mappedRegions)
      }
    } catch (error) {
      console.error('Exception fetching regions:', error)
      setRegions([])
    }
  }

  // Fetch CPVS from Supabase
  const fetchCpvs = async () => {
    try {
      const { data, error } = await supabase
        .from('cpvs')
        .select('id, cpv_code, main_cpv_description')
        .order('cpv_code', { ascending: true })
      
      if (error) {
        console.error('Error fetching CPVS:', error)
        setCpvs([])
      } else {
        const mappedCpvs = (data || []).map(cpv => ({
          id: cpv.id,
          name: `${cpv.cpv_code} - ${cpv.main_cpv_description || ''}`
        }))
        setCpvs(mappedCpvs)
      }
    } catch (error) {
      console.error('Exception fetching CPVS:', error)
      setCpvs([])
    }
  }

  // Fetch portfolio data from Supabase
  const fetchPortfolioData = async (companyId) => {
    if (!companyId) return 

    try {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching portfolio data:', error)
        return
      }

      if (data && data.length > 0) {
        const portfoliosWithCpvs = data.map(portfolio => {
          // Convert year integer to date string if needed
          let yearValue = portfolio.year
          if (typeof yearValue === 'number') {
            yearValue = `${yearValue}-01-01`
          }
          return {
            ...portfolio,
            year: yearValue || '',
            cpvs: Array.isArray(portfolio.cpvs) ? portfolio.cpvs : (portfolio.cpvs ? [portfolio.cpvs] : [])
          }
        })
        setPortfolios(portfoliosWithCpvs)
        if (portfoliosWithCpvs.length > 0) {
          setOpenPortfolioIndex(0)
        }
      } else {
        setPortfolios([{
          title: '',
          client_type: '',
          year: '',
          value_band: '0–50k',
          description: '',
          cpvs: [],
        }])
      }
    } catch (error) {
      console.error('Exception fetching portfolio data:', error)
    }
  }

  useEffect(() => {
    if (!supabase) return
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          fetchCertifications(),
          fetchRegions(),
          fetchCpvs()
        ])
      } finally {
        setIsLoading(false)
      }
    }
    loadInitialData()
  }, [supabase])

  // Fetch company data when user is available
  useEffect(() => {
    if (user?.company_id) {
      getCompany(user.company_id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.company_id])

  // Update form data when company data is available from context
  useEffect(() => {
    if (company) {
      setFormData(prev => ({
        ...prev,
        region: company.region || '',
        region_interest: Array.isArray(company.region_interest) ? company.region_interest : (company.region_interest ? [company.region_interest] : []),
        workerSize: company.worker_size || '',
        kvk_number: company.kvk_number || '',
        company_website: company.company_website || '',
        cpvs: Array.isArray(company.cpvs) ? company.cpvs : [],
        contract_type: Array.isArray(company.contract_type) ? company.contract_type : (company.contract_type ? [company.contract_type] : []),
        contract_range: company.contract_range || '0–50k',
        certification: Array.isArray(company.certification) ? company.certification : (company.certification ? [company.certification] : []),
        primary_goal: Array.isArray(company.primary_goal) ? company.primary_goal : (company.primary_goal ? [company.primary_goal] : []),
        uea_ready: company.uea_ready || false,
        match_ready: company.match_ready || false,
      }))
    }
  }, [company])

  // Fetch portfolio data when user is available
  useEffect(() => {
    if (user?.company_id) {
      fetchPortfolioData(user.company_id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.company_id])

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user updates it
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }


  const handleMultiSelectChange = (field) => (details) => {
    setFormData(prev => ({ ...prev, [field]: details.value || [] }))
    // Clear error for this field when user updates it
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSelectChange = (field) => (details) => {
    setFormData(prev => ({ ...prev, [field]: details.value[0] || '' }))
    // Clear error for this field when user updates it
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Helper functions to convert between text values and indices
  const getContractRangeIndex = (textValue) => {
    const index = contractRangeLabels.indexOf(textValue)
    return index >= 0 ? index : 0
  }

  const getValueBandIndex = (textValue) => {
    const index = valueBandLabels.indexOf(textValue)
    return index >= 0 ? index : 0
  }

  const formatContractRange = (value) => {
    return contractRangeLabels[value] || contractRangeLabels[0]
  }

  const formatValueBand = (value) => {
    return valueBandLabels[value] || valueBandLabels[0]
  }

  const addPortfolio = () => {
    if (portfolios.length >= MAX_PORTFOLIOS) {
      return
    }
    const newIndex = portfolios.length
    setPortfolios(prev => [
      ...prev,
      {
        title: '',
        client_type: '',
        year: '',
        value_band: '0–50k',
        description: '',
        cpvs: [],
        isNew: true,
      }
    ])
    setOpenPortfolioIndex(newIndex)
  }

  const removePortfolio = (index) => {
    const portfolio = portfolios[index]
    
    if (portfolio.isNew) {
      const newPortfolios = portfolios.filter((_, i) => i !== index)
      setPortfolios(newPortfolios)
      
      if (openPortfolioIndex === index) {
        if (newPortfolios.length > 0) {
          setOpenPortfolioIndex(0)
        } else {
          setOpenPortfolioIndex(null)
        }
      } else if (openPortfolioIndex > index) {
        setOpenPortfolioIndex(openPortfolioIndex - 1)
      }
    } else {
      setPortfolios(prev => 
        prev.map((p, i) => 
          i === index ? { ...p, isDelete: true } : p
        )
      )
    }
  }

  const handlePortfolioToggle = (index) => {
    setOpenPortfolioIndex(openPortfolioIndex === index ? null : index)
  }

  const updatePortfolio = (index, field, value) => {
    setPortfolios(prev => 
      prev.map((portfolio, i) => {
        if (i === index) {
          const isEdit = portfolio.id && !portfolio.isNew
          return { 
            ...portfolio, 
            [field]: value,
            isEdit: isEdit || portfolio.isEdit
          }
        }
        return portfolio
      })
    )
    // Clear error for this portfolio field when user updates it
    const errorKey = `portfolio_${index}_${field}`
    if (portfolioErrors[errorKey]) {
      setPortfolioErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  // Delete portfolios from database
  const deletePortfolios = async (portfolioIds) => {
    if (!portfolioIds || portfolioIds.length === 0) return

    const { error } = await supabase
      .from('portfolio')
      .delete()
      .in('id', portfolioIds)

    if (error) {
      throw new Error(`Failed to delete portfolios: ${error.message}`)
    }
  }

  // Update existing portfolios in database
  const updatePortfolios = async (portfoliosToUpdate) => {
    if (!portfoliosToUpdate || portfoliosToUpdate.length === 0) return

    const updatePromises = portfoliosToUpdate.map(({ portfolio, id }) => {
      const { isNew, isEdit, isDelete, ...portfolioData } = portfolio
      
      return supabase
        .from('portfolio')
        .update({
          title: portfolioData.title,
          client_type: portfolioData.client_type || null,
          year: portfolioData.year || null,
          value_band: portfolioData.value_band || null,
          description: portfolioData.description || null,
          cpvs: Array.isArray(portfolioData.cpvs) && portfolioData.cpvs.length > 0 ? portfolioData.cpvs : null,
        })
        .eq('id', id)
    })

    const updateResults = await Promise.all(updatePromises)
    const updateError = updateResults.find(result => result.error)
    
    if (updateError) {
      throw new Error(`Failed to update portfolios: ${updateError.error.message}`)
    }
  }

  // Create new portfolios in database
  const createPortfolios = async (companyId, portfoliosToCreate) => {
    if (!portfoliosToCreate || portfoliosToCreate.length === 0) return

    const insertPayload = portfoliosToCreate.map(({ isNew, isEdit, isDelete, ...portfolio }) => ({
      title: portfolio.title,
      client_type: portfolio.client_type || null,
      year: portfolio.year || null,
      value_band: portfolio.value_band || null,
      description: portfolio.description || null,
      cpvs: Array.isArray(portfolio.cpvs) && portfolio.cpvs.length > 0 ? portfolio.cpvs : null,
      company_id: companyId,
    }))

    const { error } = await supabase
      .from('portfolio')
      .insert(insertPayload)

    if (error) {
      throw new Error(`Failed to create portfolios: ${error.message}`)
    }
  }

  // Validation function
  const validateForm = () => {
    const newErrors = {}
    const newPortfolioErrors = {}

    // Validate company information fields
    if (!formData.region || formData.region.trim() === '') {
      newErrors.region = 'Region is required'
    }

    // Validate KVK number if it exists (must be exactly 8 digits)
    if (formData.kvk_number && formData.kvk_number.trim() !== '') {
      if (!/^\d{8}$/.test(formData.kvk_number.trim())) {
        newErrors.kvk_number = 'KVK number must be exactly 8 digits'
      }
    }

    if (!formData.workerSize || formData.workerSize.trim() === '') {
      newErrors.workerSize = 'Worker size is required'
    }

    if (!formData.cpvs || formData.cpvs.length === 0) {
      newErrors.cpvs = 'At least one CPVS category is required'
    }

    if (!formData.contract_type || formData.contract_type.length === 0) {
      newErrors.contract_type = 'Contract type is required'
    }

    if (!formData.contract_range || formData.contract_range.trim() === '') {
      newErrors.contract_range = 'Contract range is required'
    }

    // Validate company details fields
    if (!formData.primary_goal || formData.primary_goal.length === 0) {
      newErrors.primary_goal = 'Primary goal is required'
    }

    // Validate portfolio fields - use original index, not filtered index
    portfolios.forEach((portfolio, index) => {
      // Skip deleted portfolios
      if (portfolio.isDelete) return

      if (!portfolio.title || portfolio.title.trim() === '') {
        newPortfolioErrors[`portfolio_${index}_title`] = 'Portfolio title is required'
      }

      if (!portfolio.client_type || portfolio.client_type.trim() === '') {
        newPortfolioErrors[`portfolio_${index}_client_type`] = 'Client type is required'
      }

      const dateValue = portfolio.year?.toString().trim() || ''
      if (!dateValue) {
        newPortfolioErrors[`portfolio_${index}_year`] = 'Date is required'
      } else {
        const selectedDate = new Date(dateValue)
        const minDate = new Date('1900-01-01')
        const maxDate = new Date()
        maxDate.setFullYear(maxDate.getFullYear() + 10)
        
        if (isNaN(selectedDate.getTime())) {
          newPortfolioErrors[`portfolio_${index}_year`] = 'Invalid date format'
        } else if (selectedDate < minDate || selectedDate > maxDate) {
          newPortfolioErrors[`portfolio_${index}_year`] = `Date must be between 1900 and ${maxDate.getFullYear()}`
        }
      }

      if (!portfolio.value_band || portfolio.value_band.trim() === '') {
        newPortfolioErrors[`portfolio_${index}_value_band`] = 'Value band is required'
      }
    })

    setErrors(newErrors)
    setPortfolioErrors(newPortfolioErrors)

    // Return true if no errors
    return Object.keys(newErrors).length === 0 && Object.keys(newPortfolioErrors).length === 0
  }

  // Save portfolios using flags: isDelete, isEdit, isNew
  const savePortfolios = async (companyId) => {
    const portfoliosToDelete = portfolios.filter(p => p.isDelete && p.id)
    
    if (portfoliosToDelete.length > 0) {
      const idsToDelete = portfoliosToDelete.map(p => p.id)
      await deletePortfolios(idsToDelete)
    }

    const portfoliosToProcess = portfolios.filter(p => !p.isDelete && p.title?.trim())

    const portfoliosToUpdate = portfoliosToProcess
      .filter(p => p.isEdit && p.id && !p.isNew)
      .map(p => ({ portfolio: p, id: p.id }))
    
    await updatePortfolios(portfoliosToUpdate)

    const portfoliosToCreate = portfoliosToProcess.filter(p => p.isNew && !p.id)
    
    await createPortfolios(companyId, portfoliosToCreate)
  }

  const handleSubmit = async () => {
    if (!user) return
    
    // Validate form before submitting
    if (!validateForm()) {
      toaster.create({
        title: 'Validation Error',
        description: 'Please fix the errors in the form before saving.',
        type: 'error'
      })
      setIsSubmitting(false)
      return
    }
    
    setIsSubmitting(true)

    try {
      await savePortfolios(user.company_id)
      
      const companyUpdateData = {
        region: formData.region || null,
        region_interest: Array.isArray(formData.region_interest) && formData.region_interest.length > 0 ? formData.region_interest : null,
        certification: Array.isArray(formData.certification) && formData.certification.length > 0 ? formData.certification : null,
        cpvs: Array.isArray(formData.cpvs) && formData.cpvs.length > 0 ? formData.cpvs : null,
        worker_size: formData.workerSize || null,
        contract_type: Array.isArray(formData.contract_type) && formData.contract_type.length > 0 ? formData.contract_type : null,
        contract_range: formData.contract_range || null,
        primary_goal: Array.isArray(formData.primary_goal) && formData.primary_goal.length > 0 ? formData.primary_goal : null,
        company_website: formData.company_website || null,
        match_ready: formData.match_ready || false,
        // Note: kvk_number and uea_ready are NOT updated here as they are disabled
      }

      const { data: companyData, error: companyError } = await supabase
        .from('company')
        .update(companyUpdateData)
        .eq('id', user?.company_id)
        .select()

      if (companyError) {
        console.error('Error updating company:', companyError)
        throw companyError
      }
      
      if (!companyData || companyData.length === 0) {
        throw new Error('Company update failed - no data returned')
      }
      
      // Refresh company data
      if (user?.company_id) {
        await getCompany(user.company_id)
      }
      
      toaster.create({ 
        title: 'Profile updated successfully!', 
        description: 'Your changes have been saved.', 
        type: 'success' 
      })
      
    } catch (error) {
      console.error('Error saving profile data:', error)
      toaster.create({ 
        title: 'Failed to save profile', 
        description: error.message || 'Please try again.', 
        type: 'error' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabs = [
    {
      id: 'company-info',
      value: 'company-info',
      label: 'Company Information',
      leftIcon: <LuBuilding2 />,
      content: (
        <div className="!p-3">
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="!space-y-5">
            {/* Basic Information Card */}
            <div className="rounded-xl border-mixin !p-5 " style={{ '--border-width': '1px', '--border-color': '#efefef', background: '#fafafa' }}>
              <h3 className="text-xs !font-semibold !mb-4 uppercase tracking-wide" style={{ color: '#333333' }}>Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <SelectField
                    label="Region"
                    items={regions}
                    placeholder="Select your region"
                    value={formData.region ? [formData.region] : []}
                    onValueChange={handleSelectChange('region')}
                    required
                    invalid={!!errors.region}
                    errorText={errors.region}
                  />
                </div>

                <div className="relative">
                  <InputField
                    label="KVK Number"
                    placeholder="8-digit KVK number"
                    value={formData.kvk_number}
                    disabled={true}
                    helperText="KVK number cannot be updated through profile settings"
                    className="opacity-60 cursor-not-allowed"
                    invalid={!!errors.kvk_number}
                    errorText={errors.kvk_number}
                  />
                
                </div>
              </div>
              
              <div className="mt-4">
                <MultiSelectField
                  label="Regions of Interest"
                  items={regions}
                  placeholder="Select regions of interest"
                  value={formData.region_interest}
                  onValueChange={handleMultiSelectChange('region_interest')}
                />
              </div>
            </div>

            {/* Worker Size Card */}
            <div className="rounded-xl border-mixin !p-5" style={{ '--border-width': '1px', '--border-color': errors.workerSize ? '#ef4444' : '#efefef', background: '#fafafa' }}>
              <h3 className="text-xs !font-semibold !mb-4 uppercase tracking-wide" style={{ color: '#333333' }}>Company Size</h3>
              <Box>
                <Text fontWeight="medium" fontSize="sm" mb="3" style={{ color: '#1c1c1c' }}>
                  Worker Size
                  <Text as="span" color="red.500" ml="1">*</Text>
                </Text>
                <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="2" mt="2">
                {[
                  { id: 'small', label: 'Small', range: '1 to 10' },
                  { id: 'medium', label: 'Medium', range: '10 to 50' },
                  { id: 'large', label: 'Large', range: '50 to 100' },
                  { id: 'organization', label: 'Organization', range: '100+' },
                ].map((size) => {
                  const isSelected = formData.workerSize === size.id
                  return (
                    <Box
                      key={size.id}
                      as="button"
                      type="button"
                      onClick={() => updateFormData('workerSize', size.id)}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      p="5"
                      w="100%"
                      borderRadius="xl"
                      borderWidth="2px"
                      borderStyle="solid"
                      borderColor={isSelected ? '#1f6ae1' : '#efefef'}
                      bg={isSelected ? 'rgba(31, 106, 225, 0.08)' : 'white'}
                      transition="all 0.2s"
                      cursor="pointer"
                      _hover={{
                        borderColor: '#1f6ae1',
                        transform: 'translateY(-1px)',
                        boxShadow: 'md',
                      }}
                      _focus={{
                        outline: 'none',
                        ring: '2px',
                        ringColor: '#1f6ae1',
                        ringOffset: '1px',
                      }}
                    >
                      <Box
                        fontSize="xl"
                        mb="1"
                        color={isSelected ? '#1f6ae1' : '#333333'}
                        transition="all 0.2s"
                      >
                        <LuUserRound />
                      </Box>
                      <Text
                        fontWeight="semibold"
                        fontSize="xs"
                        color={isSelected ? '#1f6ae1' : '#1c1c1c'}
                        mb="0.5"
                      >
                        {size.label}
                      </Text>
                      <Text
                        fontSize="2xs"
                        color={isSelected ? '#1f6ae1' : '#333333'}
                      >
                        {size.range}
                      </Text>
                      
                    </Box>
                  )
                })}
                </Box>
                {errors.workerSize && (
                  <Text fontSize="xs" color="red.500" mt="2">{errors.workerSize}</Text>
                )}
              </Box>
            </div>

            {/* Business Details Card */}
            <div className="rounded-xl border-mixin !p-5" style={{ '--border-width': '1px', '--border-color': '#efefef', background: '#fafafa' }}>
              <h3 className="text-xs !font-semibold !mb-4 uppercase tracking-wide" style={{ color: '#333333' }}>Business Details</h3>
              <div className="!space-y-4">
                <div>
                  <MultiSelectField
                    label="CPVS Interested"
                    items={cpvs}
                    placeholder="Select CPVS categories"
                    value={formData.cpvs}
                    onValueChange={handleMultiSelectChange('cpvs')}
                    required
                    invalid={!!errors.cpvs}
                    errorText={errors.cpvs}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <MultiSelectField
                      label="Contract Type"
                      items={contractTypes}
                      placeholder="Select contract type"
                      value={formData.contract_type}
                      onValueChange={handleMultiSelectChange('contract_type')}
                      required
                      invalid={!!errors.contract_type}
                      errorText={errors.contract_type}
                    />
                  </div>

                  <InputField
                    label="Company Website"
                    type="url"
                    placeholder="https://www.example.com (optional)"
                    value={formData.company_website}
                    onChange={(e) => updateFormData('company_website', e.target.value)}
                  />
                </div>

                <div>
                  <SliderField
                    label="Contract Range"
                    value={getContractRangeIndex(formData.contract_range)}
                    onChange={(value) => updateFormData('contract_range', contractRangeLabels[value] || contractRangeLabels[0])}
                    min={0}
                    max={3}
                    step={1}
                    required
                    maxW="100%"
                    formatValue={formatContractRange}
                  />
                  {errors.contract_range && (
                    <Text fontSize="xs" color="red.500" mt="1">{errors.contract_range}</Text>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      ),
    },
    {
      id: 'company-details',
      value: 'company-details',
      label: 'Company Details',
      leftIcon: <LuGlobe />,
      content: (
        <div className="!p-3">
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="!space-y-5">
            {/* Certification & Goals Card */}
            <div className="rounded-xl border-mixin !p-5" style={{ '--border-width': '1px', '--border-color': '#efefef', background: '#fafafa' }}>
              <h3 className="text-xs !font-semibold !mb-4 uppercase tracking-wide" style={{ color: '#333333' }}>Certification & Goals</h3>
              <div className="!space-y-4">
                <MultiSelectField
                  label="Certification"
                  items={certifications}
                  placeholder="Select certification"
                  value={formData.certification}
                  onValueChange={handleMultiSelectChange('certification')}
                />

                <MultiSelectField
                  label="What's your main goal?"
                  items={primaryGoalOptions}
                  placeholder="Select your goals"
                  value={formData.primary_goal}
                  onValueChange={handleMultiSelectChange('primary_goal')}
                  required
                  invalid={!!errors.primary_goal}
                  errorText={errors.primary_goal}
                />
              </div>
            </div>

            {/* Status Card */}
            <div className="rounded-xl border-mixin !p-5" style={{ '--border-width': '1px', '--border-color': '#efefef', background: '#fafafa' }}>
              <h3 className="text-xs !font-semibold !mb-4 uppercase tracking-wide" style={{ color: '#333333' }}>Status & Readiness</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Box opacity="0.6" cursor="not-allowed">
                    <Toggle
                      label="UEA Ready"
                      checked={formData.uea_ready}
                      disabled={true}
                      helperText="UEA Ready status cannot be updated through profile settings"
                    />
                  </Box>
                 
                </div>
                <Toggle
                  label="Match Ready"
                  checked={formData.match_ready}
                  onCheckedChange={(details) => updateFormData('match_ready', details.checked)}
                  helperText="Certification is match ready"
                />
              </div>
            </div>
          </div>
          </div>
        </div>
      ),
    },
    {
      id: 'portfolio',
      value: 'portfolio',
      label: 'Portfolio',
      leftIcon: <LuBriefcase />,
      content: (
        <div className="!p-3">
          <div className="space-y-4 animate-in fade-in duration-300">
          <div className="!mb-4 !pb-2  flex justify-between items-center">
                    <div className='flex flex-col '>
                      <h2 className="text-xl flex items-center gap-2 !font-bold !text-black">
                        Showcase your best work   ({portfolios.filter(p => !p.isDelete).length} of {MAX_PORTFOLIOS})
                      </h2>
                     
                    </div>
                    <IconButton
                      type="button"
                      variant="solid"
                      onClick={addPortfolio}
                      size="sm"
                      disabled={portfolios.filter(p => !p.isDelete).length >= MAX_PORTFOLIOS}
                      className="!text-white !bg-gradient-to-br !from-primary !to-secondary disabled:!opacity-50 disabled:!cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                      aria-label="Add new portfolio"
                    >
                      <LuPlus />
                    </IconButton>
                  </div>
            <div className="!space-y-3">
              {portfolios
                .map((portfolio, index) => ({ portfolio, index }))
                .filter(({ portfolio }) => !portfolio.isDelete)
                .map(({ portfolio, index }, displayIndex) => (
                <div key={portfolio.id || index} className="rounded-xl border-mixin overflow-hidden transition-all duration-200 hover:shadow-md" style={{ '--border-width': '1px', '--border-color': openPortfolioIndex === index ? '#1f6ae1' : '#efefef', background: openPortfolioIndex === index ? '#fafafa' : '#ffffff' }}>
                  <Collapsible
                    title={`Portfolio Project ${displayIndex + 1}`}
                    open={openPortfolioIndex === index}
                    onOpenChange={() => handlePortfolioToggle(index)}
                    className="border-0"
                  >
                  <div className="!space-y-3 !pt-3">
                    <div className="flex items-center justify-between !mb-3 !pb-3 " >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(31, 106, 225, 0.1)' }}>
                          <LuBriefcase className="w-3 h-3" style={{ color: '#1f6ae1' }} />
                        </div>
                        <span className="text-sm !font-semibold" style={{ color: '#333333' }}>Project Details</span>
                      </div>
                      {portfolios.filter(p => !p.isDelete).length > 1 && (
                        <IconButton
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            removePortfolio(index)
                          }}
                          aria-label="Remove portfolio"
                         className="!text-red"
                        >
                          <LuTrash2 />
                        </IconButton>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <InputField
                          label="Title"
                          placeholder="Enter project title"
                          value={portfolio.title}
                          onChange={(e) => updatePortfolio(index, 'title', e.target.value)}
                          required
                          invalid={!!portfolioErrors[`portfolio_${index}_title`]}
                          errorText={portfolioErrors[`portfolio_${index}_title`]}
                        />
                      </div>

                      <div>
                        <SelectField
                          label="Client Type"
                          items={clientTypes}
                          placeholder="Select client type"
                          value={portfolio.client_type ? [portfolio.client_type] : []}
                          onValueChange={(details) => updatePortfolio(index, 'client_type', details.value[0] || '')}
                          required
                          invalid={!!portfolioErrors[`portfolio_${index}_client_type`]}
                          errorText={portfolioErrors[`portfolio_${index}_client_type`]}
                        />
                      </div>
                    </div>

                    <div>
                      <InputField
                        label="Date"
                        type="date"
                        placeholder="Select date"
                        value={portfolio.year || ''}
                        onChange={(e) => {
                          updatePortfolio(index, 'year', e.target.value)
                        }}
                        min="1900-01-01"
                        max={`${new Date().getFullYear() + 10}-12-31`}
                        required
                        invalid={!!portfolioErrors[`portfolio_${index}_year`]}
                        errorText={portfolioErrors[`portfolio_${index}_year`]}
                      />
                    </div>

                    <div>
                      <SliderField
                        label="Value Band"
                        value={getValueBandIndex(portfolio.value_band)}
                        onChange={(value) => updatePortfolio(index, 'value_band', valueBandLabels[value] || valueBandLabels[0])}
                        min={0}
                        max={3}
                        step={1}
                        required
                        maxW="100%"
                        formatValue={formatValueBand}
                      />
                      {portfolioErrors[`portfolio_${index}_value_band`] && (
                        <Text fontSize="xs" color="red.500" mt="1">{portfolioErrors[`portfolio_${index}_value_band`]}</Text>
                      )}
                    </div>

                    <div>
                      <MultiSelectField
                        label="CPVS Categories"
                        items={cpvs}
                        placeholder="Select CPVS categories for this project"
                        value={portfolio.cpvs || []}
                        onValueChange={(details) => updatePortfolio(index, 'cpvs', details.value || [])}
                      />
                    </div>

                    <InputField
                      label="Description"
                      placeholder="Enter project description"
                      value={portfolio.description}
                      onChange={(e) => updatePortfolio(index, 'description', e.target.value)}
                      helperText="Brief description of the project"
                    />
                  </div>
                  </Collapsible>
                </div>
              ))}

           
          </div>
          </div>
        </div>
      ),
    },
  ]

  // Show loading while auth is loading or initial data is being fetched
  if (authLoading || isLoading) {
    return <Loading fullScreen message="Loading profile data..." />
  }

  return (
    <div className="min-h-screen h-auto !py-8 !bg-gradient-to-br !from-off-white !to-light-gray !p-2 relative overflow-hidden flex justify-center">
     
     

      <div className="w-full max-w-7xl !px-8 mx-auto relative z-10">
        {/* Compact Header Section */}
        <div className="!mb-6 text-start animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-start gap-3 !mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #1f6ae1, #6b4eff)' }}>
              <LuSettings className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl !font-bold" style={{ color: '#1c1c1c' }}>
              Profile Settings
            </h1>
          </div>
          <p className="text-sm" style={{ color: '#333333' }}>
            Manage your company information and showcase your portfolio
          </p>
        </div>

        {/* Sleek Profile Card with Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border-mixin overflow-hidden relative" style={{ '--border-width': '1px', '--border-color': '#efefef' }}>
          {isSubmitting && <LoadingOverlay message="Saving changes..." />}
          {/* Tab Header - using theme colors */}
          <div className="border-b border-mixin !px-5 !pt-4 !pb-0 !bg-white" style={{ '--border-width': '1px', '--border-color': '#efefef',  }}>
            <TabButton
              tabs={tabs}
              value={activeTab}
              onValueChange={(details) => setActiveTab(details.value)}
              variant="line"
              colorScheme="primary"
              size="lg"
            />
          </div>

          {/* Compact Save Button Section */}
          <div className="border-t border-mixin !px-6 !py-4 flex items-center justify-between flex-wrap gap-3" style={{ '--border-width': '1px', '--border-color': '#efefef', background: '#fafafa' }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: '#333333' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#1f6ae1' }}></div>
              <span>Click save to update your profile</span>
            </div>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="!text-white disabled:!opacity-50 disabled:!cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 !px-6"
              style={{ background: 'linear-gradient(135deg, #1f6ae1, #6b4eff)' }}
              size="md"
            >
              <LuSave className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
