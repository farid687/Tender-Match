'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/auth/context/auth-context'
import { useCompany } from '@/hooks/useCompany'
import { toaster } from '@/elements/toaster'
import { Button } from '@/elements/button'
import { IconButton } from '@/elements/icon-button'
import { InputField } from '@/elements/input'
import { Checkbox } from '@/elements/checkbox'
import { SelectField } from '@/elements/select'
import { MultiSelectField } from '@/elements/multi-select'
import { SliderField } from '@/elements/slider'
import { Toggle } from '@/elements/toggle'
import { Collapsible } from '@/elements/collapsible'
import { TabButton } from '@/elements/tab-button'
import { Box, Text } from '@chakra-ui/react'
import { LuBuilding2, LuGlobe, LuUserRound, LuBriefcase, LuPlus, LuTrash2, LuSave, LuSettings } from 'react-icons/lu'
import { clientTypes, contractTypes, contractRangeLabels, valueBandLabels, MAX_PORTFOLIOS } from '../onboarding/variables'
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
    workerSize: '',
    kvk_number: '',
    company_website: '',
    cpvs: [],
    contract_type: '',
    contract_range: '0–50k',

    // Step 2: Company Details
    certification: '',
    primary_goal: '',
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
        setPortfolios(data)
        if (data.length > 0) {
          setOpenPortfolioIndex(0)
        }
      } else {
        setPortfolios([{
          title: '',
          client_type: '',
          year: '',
          value_band: '0–50k',
          description: '',
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
        workerSize: company.worker_size || '',
        kvk_number: company.kvk_number || '',
        company_website: company.company_website || '',
        cpvs: Array.isArray(company.cpvs) ? company.cpvs : [],
        contract_type: company.contract_type || '',
        contract_range: company.contract_range || '0–50k',
        certification: company.certification || '',
        primary_goal: company.primary_goal || '',
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

  const handleCertificationChange = (details) => {
    const certificationId = details.value[0] || ''
    updateFormData('certification', certificationId)
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
          year: portfolioData.year ? parseInt(portfolioData.year) : null,
          value_band: portfolioData.value_band || null,
          description: portfolioData.description || null,
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
      year: portfolio.year ? parseInt(portfolio.year) : null,
      value_band: portfolio.value_band || null,
      description: portfolio.description || null,
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

    if (!formData.workerSize || formData.workerSize.trim() === '') {
      newErrors.workerSize = 'Worker size is required'
    }

    if (!formData.cpvs || formData.cpvs.length === 0) {
      newErrors.cpvs = 'At least one CPVS category is required'
    }

    if (!formData.contract_type || formData.contract_type.trim() === '') {
      newErrors.contract_type = 'Contract type is required'
    }

    if (!formData.contract_range || formData.contract_range.trim() === '') {
      newErrors.contract_range = 'Contract range is required'
    }

    // Validate company details fields
    if (!formData.primary_goal || formData.primary_goal.trim() === '') {
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

      const yearValue = portfolio.year?.toString().trim() || ''
      if (!yearValue) {
        newPortfolioErrors[`portfolio_${index}_year`] = 'Year is required'
      } else {
        const yearNum = parseInt(yearValue)
        const currentYear = new Date().getFullYear()
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 10) {
          newPortfolioErrors[`portfolio_${index}_year`] = `Year must be between 1900 and ${currentYear + 10}`
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
        certification: formData.certification || null,
        cpvs: Array.isArray(formData.cpvs) && formData.cpvs.length > 0 ? formData.cpvs : null,
        worker_size: formData.workerSize || null,
        contract_type: formData.contract_type || null,
        contract_range: formData.contract_range || null,
        primary_goal: formData.primary_goal || null,
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
            <div className="rounded-xl border-mixin !p-5" style={{ '--border-width': '1px', '--border-color': '#efefef', background: '#fafafa' }}>
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
                    placeholder="Enter your KVK number"
                    value={formData.kvk_number}
                    disabled={true}
                    helperText="KVK number cannot be updated through profile settings"
                    className="opacity-60 cursor-not-allowed"
                  />
                  <div className="absolute top-0 right-0 !mt-6 !mr-3">
                    <div className="!bg-gray-100 !text-gray-500 text-xs !px-2 !py-1 rounded-md !font-medium">
                      Read Only
                    </div>
                  </div>
                </div>
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
                    <SelectField
                      label="Contract Type"
                      items={contractTypes}
                      placeholder="Select contract type"
                      value={formData.contract_type ? [formData.contract_type] : []}
                      onValueChange={handleSelectChange('contract_type')}
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
                <SelectField
                  label="Certification"
                  items={certifications}
                  placeholder="Select certification"
                  value={formData.certification ? [formData.certification] : []}
                  onValueChange={handleCertificationChange}
                />

                <Box>
                  <Text fontWeight="medium" fontSize="sm" mb="4">
                    What's your main goal?
                    <Text as="span" color="red.500" ml="1">*</Text>
                  </Text>
                  <div className={`flex flex-col gap-2 rounded-lg !p-3 border-mixin ${errors.primary_goal ? '!border-red-500' : ''}`} style={{ '--border-width': errors.primary_goal ? '2px' : '1px', '--border-color': errors.primary_goal ? '#ef4444' : '#efefef', background: '#ffffff' }}>
                    {[
                      { id: 'find_tenders', label: 'Find tenders' },
                      { id: 'find_partners', label: 'Find partners' },
                      { id: 'both', label: 'Both' }
                    ].map((option) => (
                      <Checkbox
                        key={option.id}
                        checked={formData.primary_goal === option.id}
                        onCheckedChange={(details) => {
                          if (details.checked) {
                            updateFormData('primary_goal', option.id)
                          }
                        }}
                        className="cursor-pointer hover:!bg-white/50 !p-2 rounded-lg transition-colors"
                      >
                        <span className="!text-sm !font-medium text-black">{option.label}</span>
                      </Checkbox>
                    ))}
                  </div>
                  {errors.primary_goal && (
                    <Text fontSize="xs" color="red.500" mt="1">{errors.primary_goal}</Text>
                  )}
                </Box>
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
                  <div className="absolute top-0 right-0 !mt-0">
                    <div className="!bg-gray-100 !text-gray-500 text-xs !px-2 !py-1 rounded-md !font-medium">
                      Read Only
                    </div>
                  </div>
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
                        label="Year"
                        type="number"
                        placeholder="e.g., 2014, 1999"
                        value={portfolio.year}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '' || (value.length <= 4 && /^\d+$/.test(value))) {
                            updatePortfolio(index, 'year', value)
                          }
                        }}
                        min="1900"
                        max={new Date().getFullYear() + 10}
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
    <div className="min-h-screen !bg-gradient-to-br !from-off-white !to-light-gray !p-4 md:!p-6 relative overflow-hidden flex items-center justify-center">
      {/* Decorative background elements - using theme colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(31, 106, 225, 0.05)' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(107, 78, 255, 0.05)' }}></div>
      </div>

      <div className="w-full max-w-5xl mx-auto relative z-10">
        {/* Compact Header Section */}
        <div className="!mb-6 text-start animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-start gap-3 !mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #1f6ae1, #6b4eff)' }}>
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
          <div className="border-b border-mixin !px-5 !pt-4 !pb-0" style={{ '--border-width': '1px', '--border-color': '#efefef', background: 'linear-gradient(to right, rgba(31, 106, 225, 0.03), rgba(107, 78, 255, 0.03))' }}>
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
