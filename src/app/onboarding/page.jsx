'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Box, Text } from '@chakra-ui/react'
import { LuBuilding2, LuGlobe, LuArrowRight, LuArrowLeft, LuCheck, LuUserRound, LuBriefcase, LuPlus, LuTrash2, LuForward } from 'react-icons/lu'
import { clientTypes, contractTypes, contractRangeLabels, valueBandLabels, MAX_PORTFOLIOS } from './variables'
import { Loading, LoadingOverlay } from '@/elements/loading'

const steps = [
  {
    id: 1,
    title: 'Company Information',
    description: 'Tell us about your company',
    icon: <LuBuilding2 />,
  },
  {
    id: 2,
    title: 'Company Details',
    description: 'Add more details about your business',
    icon: <LuGlobe />,
  },
  {
    id: 3,
    title: 'Portfolio Details',
    description: 'Add your portfolio projects',
    icon: <LuBriefcase />,
  },
]

export default function OnboardingPage() {
  const { user, company, loading: authLoading } = useAuth()
  const { getCompany } = useCompany()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [certifications, setCertifications] = useState([])
  const [regions, setRegions] = useState([])
  const [cpvs, setCpvs] = useState([])
  const [openPortfolioIndex, setOpenPortfolioIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [portfolioErrors, setPortfolioErrors] = useState({})
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
        // Map to ensure id and name structure
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
        // Map to ensure id and name structure
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
        // Map cpv_code and main_cpv_description to name
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

    // Only remove new portfolios (not saved yet)
    if (portfolio.isNew || !portfolio.id) {
      const newPortfolios = portfolios.filter((_, i) => i !== index)
      setPortfolios(newPortfolios)

      // If we removed the open portfolio, open the first one or close all
      if (openPortfolioIndex === index) {
        if (newPortfolios.length > 0) {
          setOpenPortfolioIndex(0)
        } else {
          setOpenPortfolioIndex(null)
        }
      } else if (openPortfolioIndex > index) {
        setOpenPortfolioIndex(openPortfolioIndex - 1)
      }
    }
  }

  const handlePortfolioToggle = (index) => {
    // Only allow one portfolio to be open at a time
    setOpenPortfolioIndex(openPortfolioIndex === index ? null : index)
  }

  const updatePortfolio = (index, field, value) => {
    setPortfolios(prev =>
      prev.map((portfolio, i) => {
        if (i === index) {
          return {
            ...portfolio,
            [field]: value
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

  // Validation functions for each step
  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.region || formData.region.trim() === '') {
      newErrors.region = 'Region is required'
    }
    
    if (!formData.kvk_number || formData.kvk_number.trim() === '') {
      newErrors.kvk_number = 'KVK number is required'
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
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    
    if (!formData.primary_goal || formData.primary_goal.trim() === '') {
      newErrors.primary_goal = 'Primary goal is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newPortfolioErrors = {}
    
    portfolios.forEach((portfolio, index) => {
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
    
    setPortfolioErrors(newPortfolioErrors)
    return Object.keys(newPortfolioErrors).length === 0
  }

  const handleNext = () => {
    // Validate current step before moving to next
    let isValid = true
    
    if (currentStep === 1) {
      isValid = validateStep1()
    } else if (currentStep === 2) {
      isValid = validateStep2()
    }
    
    if (!isValid) {
      
      return
    }
    
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      // If moving to portfolio step, open the first portfolio
      if (nextStep === 3 && portfolios.length > 0) {
        setOpenPortfolioIndex(0)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Create new portfolios in database
  const createPortfolios = async (companyId, portfoliosToCreate) => {
    if (!portfoliosToCreate || portfoliosToCreate.length === 0) return

    // Remove flags before sending to database
    const insertPayload = portfoliosToCreate.map(({ isNew, ...portfolio }) => ({
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

  // Save portfolios - only create new ones during onboarding
  const savePortfolios = async (companyId) => {
    // Only create new portfolios (must not have database id)
    const portfoliosToCreate = portfolios
      .filter(p => (!p.id || p.isNew) && p.title?.trim())

    await createPortfolios(companyId, portfoliosToCreate)
  }



  const handleSubmit = async (e) => {
    if (!user) return
    
    // Validate all steps before submitting
    const step1Valid = validateStep1()
    const step2Valid = validateStep2()
    const step3Valid = validateStep3()
    
    if (!step1Valid || !step2Valid || !step3Valid) {
      // Switch to the step with errors
      if (!step1Valid) {
        setCurrentStep(1)
      } else if (!step2Valid) {
        setCurrentStep(2)
      } else if (!step3Valid) {
        setCurrentStep(3)
      }
      
      toaster.create({
        title: 'Validation Error',
        description: 'Please fix the errors in the form before submitting.',
        type: 'error'
      })
      return
    }
    
    setIsSubmitting(true)

    try {
      // Step 1: Insert portfolio items FIRST
      await savePortfolios(user.company_id)
      // Step 2: Update company table AFTER portfolio insert is complete
      const companyUpdateData = {
        is_onboarded: true,
        region: formData.region || null,
        certification: formData.certification || null,
        cpvs: Array.isArray(formData.cpvs) && formData.cpvs.length > 0 ? formData.cpvs : null,
        kvk_number: formData.kvk_number || null,
        worker_size: formData.workerSize || null,
        contract_type: formData.contract_type || null,
        contract_range: formData.contract_range || null,
        primary_goal: formData.primary_goal || null,
        company_website: formData.company_website || null,
        uea_ready: formData.uea_ready || false,
        match_ready: formData.match_ready || false,
        portfolio: user?.company_id, // Set portfolio field to company_id as per requirement
      }

      // Update company table - wait for this to complete
      const { data: companyData, error: companyError } = await supabase
        .from('company')
        .update(companyUpdateData)
        .eq('id', user?.company_id)
        .select()

      if (companyError) {
        console.error('Error updating company:', companyError)
        throw companyError
      }
      // Verify company was updated successfully
      if (!companyData || companyData.length === 0) {
        throw new Error('Company update failed - no data returned')
      }

      // Refresh company data
      if (user?.company_id) {
        await getCompany(user.company_id)
      }

      // Step 3: Show success and redirect
      toaster.create({
        title: 'Onboarding completed successfully!',
        description: 'You can now start using the platform.',
        type: 'success'
      })

      // Small delay to ensure toast is shown before redirect
      setTimeout(() => {
        router.push('/')
      }, 500)

    } catch (error) {
      console.error('Error saving onboarding data:', error)
      toaster.create({
        title: 'Failed to save onboarding data',
        description: error.message || 'Please try again.',
        type: 'error'
      })
      setIsSubmitting(false)
    }
  }

  const isLastStep = currentStep === steps.length
  const isFirstStep = currentStep === 1

  // Show loading while auth is loading or initial data is being fetched
  if (authLoading || isLoading) {
    return <Loading fullScreen message="Loading onboarding data..." />
  }

  // If company is already onboarded, show success message with navigation button
  if (company?.is_onboarded) {
    return (
      <div className="min-h-screen !bg-gradient-to-br !from-off-white !to-light-gray !p-4 md:!p-6 relative overflow-hidden flex items-center justify-center">
        {/* Decorative background elements - using theme colors */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl !bg-primary/5"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl !bg-secondary/5"></div>
        </div>

        <div className="w-full max-w-5xl mx-auto relative z-10">
         

          {/* Success Card - Matching Profile Style */}
          <div className="bg-white rounded-2xl shadow-lg border-mixin overflow-hidden" style={{ '--border-width': '1px', '--border-color': '#efefef' }}>
            <div className="!p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
                <div className="w-20 h-20 !mb-4 rounded-full flex items-center justify-center shadow-lg !bg-gradient-to-br !from-green-600 !to-green-500">
                  <LuCheck className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl !font-bold !mb-2 !text-black">You are good to go!</h2>
                  <p className="!text-dark-gray">Your onboarding is complete. You can now start using the platform.</p>
                </div>
                <Button
                  type="button"
                  onClick={() => router.push('/')}
                  className="!text-white !bg-gradient-to-br !from-primary !to-secondary shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 !px-6 !mt-6"
                  size="md"
                >
                  Go to Dashboard
                  <LuArrowRight />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen !bg-gradient-to-br !from-off-white !to-light-gray !p-4 md:!p-6 relative overflow-hidden flex items-center justify-center">
      {/* Decorative background elements - using theme colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl !bg-primary/5"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl !bg-secondary/5"></div>
      </div>

      <div className="w-full max-w-5xl mx-auto relative z-10">
        {/* Progress Indicator - Compact */}
        <div className="!mb-4">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-md ${currentStep > step.id
                        ? 'bg-gradient-to-br !from-success !to-success/80 border-success text-white'
                        : currentStep === step.id
                          ? 'bg-gradient-to-br !from-primary !to-primary/80 border-primary text-white shadow-primary/20'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                  >
                    {currentStep > step.id ? (
                      <LuCheck className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:flex-shrink-0">
                        {step.icon}
                      </div>
                    )}
                  </div>
                  <div className="!mt-2 text-center max-w-[100px]">
                    <p
                      className={`text-xs !font-semibold transition-colors ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                        }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="relative mx-3 flex items-center">
                    <div className="h-1 w-16 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${currentStep > step.id
                            ? '!bg-gradient-to-r !from-success !to-success/80 w-full'
                            : 'bg-gray-200 w-0'
                          }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card - Matching Profile Style */}
        <div className="bg-white rounded-2xl shadow-lg border-mixin overflow-hidden relative" style={{ '--border-width': '1px', '--border-color': '#efefef' }}>
          {isSubmitting && <LoadingOverlay message="Saving your information..." />}
          <div className="!p-2" data-protonpass-form="">
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="!p-2">
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="!mb-4 !pb-3">
                    <h2 className="text-xl !font-bold !text-black">
                      {steps[0].title}
                    </h2>
                    <p className="text-sm !mt-1 !text-gray-600">
                      {steps[0].description}
                    </p>
                  </div>
                  <div className="!space-y-3">
                    {/* Basic Information Card */}
                    <div className="rounded-xl border-mixin !p-4 !bg-very-light-gray" style={{ '--border-width': '1px', '--border-color': '#efefef' }}>
                      <h3 className="text-xs !font-semibold !mb-3 uppercase tracking-wide !text-dark-gray">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                        <div>
                          <InputField
                            label="KVK Number"
                            placeholder="Enter your KVK number"
                            value={formData.kvk_number}
                            onChange={(e) => updateFormData('kvk_number', e.target.value)}
                            required
                            invalid={!!errors.kvk_number}
                            errorText={errors.kvk_number}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Worker Size Card */}
                    <div className={`rounded-xl border-mixin !p-4 !bg-very-light-gray ${errors.workerSize ? '!border-red-500' : ''}`} style={{ '--border-width': errors.workerSize ? '2px' : '1px', '--border-color': errors.workerSize ? '#ef4444' : '#efefef' }}>
                      <h3 className="text-xs !font-semibold !mb-3 uppercase tracking-wide !text-dark-gray">Company Size</h3>
                      <Box>
                        <Text fontWeight="medium" fontSize="sm" mb="2" className="!text-black">
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
                                p="4"
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
                    <div className="rounded-xl border-mixin !p-4 !bg-very-light-gray" style={{ '--border-width': '1px', '--border-color': '#efefef' }}>
                      <h3 className="text-xs !font-semibold !mb-3 uppercase tracking-wide !text-dark-gray">Business Details</h3>
                      <div className="!space-y-3">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                            label="Interested Contract Amount"
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
            )}

            {/* Step 2: Company Details */}
            {currentStep === 2 && (
              <div className="!p-2">
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="!mb-4 !pb-3">
                    <h2 className="text-xl !font-bold !text-black">
                      {steps[1].title}
                    </h2>
                    <p className="text-sm !mt-1 !text-gray-600">
                      {steps[1].description}
                    </p>
                  </div>
                  <div className="!space-y-3">
                    {/* Certification & Goals Card */}
                    <div className="rounded-xl border-mixin !p-4 !bg-very-light-gray" style={{ '--border-width': '1px', '--border-color': '#efefef' }}>
                      <h3 className="text-xs !font-semibold !mb-3 uppercase tracking-wide !text-dark-gray">Certification & Goals</h3>
                      <div className="!space-y-3">
                        <Box>
                          <SelectField
                            label="Certification"
                            items={certifications}
                            placeholder="Select certification"
                            value={formData.certification ? [formData.certification] : []}
                            onValueChange={handleCertificationChange}
                          />
                          <Text fontSize="xs" color="gray.500" mt="1">
                            Select your company certification or equivalent qualification
                          </Text>
                        </Box>

                        <Box>
                          <Text fontWeight="medium" fontSize="sm" mb="3">
                            What's your main goal?
                            <Text as="span" color="red.500" ml="1">*</Text>
                          </Text>
                          <div className={`flex flex-col gap-2 rounded-lg !p-2 border-mixin !bg-white ${errors.primary_goal ? '!border-red-500' : ''}`} style={{ '--border-width': errors.primary_goal ? '2px' : '1px', '--border-color': errors.primary_goal ? '#ef4444' : '#efefef' }}>
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
                    <div className="rounded-xl border-mixin !p-4 !bg-very-light-gray" style={{ '--border-width': '1px', '--border-color': '#efefef' }}>
                      <h3 className="text-xs !font-semibold !mb-3 uppercase tracking-wide !text-dark-gray">Status & Readiness</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Toggle
                          label="UEA Ready"
                          checked={formData.uea_ready}
                          onCheckedChange={(details) => updateFormData('uea_ready', details.checked)}
                          helperText="Certification is UEA ready"
                        />
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
            )}

            {/* Step 3: Portfolio */}
            {currentStep === 3 && (
              <div className="!p-2">
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="!mb-4 !pb-2  flex justify-between items-center">
                    <div className='flex flex-col '>
                      <h2 className="text-xl flex items-center gap-2 !font-bold !text-black">
                        Showcase your best work  <p className="!font-semibold !text-primary">
                          ({portfolios.length} of {MAX_PORTFOLIOS})
                        </p>
                      </h2>
                      <p className="text-sm !text-gray-600">
                        {steps[2].description}
                      </p>
                    </div>
                    <IconButton
                      type="button"
                      variant="solid"
                      onClick={addPortfolio}
                      size="sm"
                      disabled={portfolios.length >= MAX_PORTFOLIOS}
                      className="!text-white !bg-gradient-to-br !from-primary !to-secondary disabled:!opacity-50 disabled:!cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
                      aria-label="Add new portfolio"
                    >
                      <LuPlus />
                    </IconButton>
                  </div>
                  <div className="!space-y-4 !mb-2">
                    {portfolios
                      .map((portfolio, index) => ({ portfolio, index }))
                      .map(({ portfolio, index }, displayIndex) => (
                        <div key={portfolio.id || index} className={`rounded-xl border-mixin overflow-hidden transition-all duration-200 hover:shadow-md ${openPortfolioIndex === index ? '!bg-very-light-gray' : '!bg-white'}`} style={{ '--border-width': '1px', '--border-color': openPortfolioIndex === index ? '#1f6ae1' : '#efefef' }}>
                          <Collapsible
                            title={`Portfolio Project ${displayIndex + 1}`}
                            open={openPortfolioIndex === index}
                            onOpenChange={() => handlePortfolioToggle(index)}
                            className="border-0"
                          >
                            <div className="!space-y-2 !pt-2">
                              <div className="flex items-center justify-between !mb-2 !pb-2 " >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-md flex items-center justify-center !bg-primary/10">
                                    <LuBriefcase className="w-3 h-3 !text-primary" />
                                  </div>
                                  <span className="text-sm !font-semibold !text-dark-gray">Project Details</span>
                                </div>
                                {portfolios.length > 1 && (
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

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            )}

            {/* Navigation Buttons - Matching Profile Style */}
            <div className="border-t border-mixin !px-4 !py-3 flex items-center justify-between flex-wrap gap-3 !bg-very-light-gray" style={{ '--border-width': '1px', '--border-color': '#efefef' }}>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isFirstStep}
                  className="!border-gray-300 !text-gray-700 hover:!bg-gray-50 disabled:!opacity-40 disabled:!cursor-not-allowed transition-all duration-200"
                >
                  <LuArrowLeft />
                  Back
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push('/')}
                  className="!text-gray-500 hover:!text-gray-700 hover:!bg-gray-100 transition-all duration-200"
                >
                  <LuForward className="w-4 h-4" />
                  Skip for now
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs !text-dark-gray">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse !bg-primary"></div>
                <span>Step {currentStep} of {steps.length}</span>
              </div>

              {isLastStep ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="!text-white !bg-gradient-to-br !from-primary !to-secondary disabled:!opacity-50 disabled:!cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 !px-6"
                  size="md"
                >
                  <LuCheck className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : 'Complete'}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="!text-white !bg-gradient-to-br !from-primary !to-secondary shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 !px-6"
                  size="md"
                >
                  Next
                  <LuArrowRight />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
