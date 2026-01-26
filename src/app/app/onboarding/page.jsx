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
import { SelectField } from '@/elements/select'
import { MultiSelectField } from '@/elements/multi-select'
import { SliderField } from '@/elements/slider'
import { Toggle } from '@/elements/toggle'
import { Collapsible } from '@/elements/collapsible'
import { Box, Text, Heading, VStack, HStack } from '@chakra-ui/react'
import { LuBuilding2, LuGlobe, LuArrowRight, LuArrowLeft, LuCheck, LuUserRound, LuBriefcase, LuPlus, LuTrash2, LuForward } from 'react-icons/lu'
import { BsExclamationCircle } from 'react-icons/bs'
import { Tooltip } from '@/elements/tooltip'
import { clientTypes, contractTypes, contractRangeLabels, valueBandLabels, MAX_PORTFOLIOS, primaryGoalOptions, targetTendersOptions } from './variables'
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
  // Separate state for company certifications
  const [companyCertifications, setCompanyCertifications] = useState([]) // Array of { certification_id, status, notes?, isExisting? }
  const [formData, setFormData] = useState({
    // Step 1: Company Information
    region: '',
    region_interest: [],
    workerSize: '',
    kvk_number: '',
    company_website: '',
    cpvs: [],
    contract_type: [],
    contract_range: '€50k – €250k',

    // Step 2: Company Details
    primary_goal: [],
    target_tenders: '',
    uea_ready: false,
    match_ready: false,
  })

  // Separate state for portfolios
  const [portfolios, setPortfolios] = useState([
    {
      title: '',
      client_type: '',
      year: '',
      value_band: '€50k – €250k',
      description: '',
      cpvs: [],
    }
  ])

  // Fetch certifications from Supabase
  const fetchCertifications = async () => {
    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('id, code, name, category, description, is_equivalent')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching certifications:', error)
        setCertifications([])
      } else {
        // Map to ensure id, name, category, description, and is_equivalent structure
        const mappedCertifications = (data || []).map(cert => ({
          id: cert.id,
          code: cert.code || '',
          name: cert.name,
          category: cert.category || 'Other',
          description: cert.description || '',
          is_equivalent: cert.is_equivalent || false
        }))
        setCertifications(mappedCertifications)
      }
    } catch (error) {
      console.error('Exception fetching certifications:', error)
      setCertifications([])
    }
  }

  // Fetch company certifications from company_certifications table
  const fetchCompanyCertifications = async (companyId) => {
    if (!companyId) return

    try {
      const { data, error } = await supabase
        .from('company_certifications')
        .select('id, certification_id, status, notes')
        .eq('company_id', companyId)

      if (error) {
        console.error('Error fetching company certifications:', error)
        return []
      }

      if(data){
        const companyCertifications = data.map(certi => ({
          certification_id: certi.certification_id,
          status: certi.status || 'certified',
          notes: certi.notes || '',
          isExisting: true
        }))
        setCompanyCertifications(companyCertifications)
      }
     
    } catch (error) {
      console.error('Exception fetching company certifications:', error)
      return []
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
        const portfoliosWithCpvs = data.map(portfolio => ({
          ...portfolio,
          cpvs: Array.isArray(portfolio.cpvs) ? portfolio.cpvs : (portfolio.cpvs ? [portfolio.cpvs] : [])
        }))
        setPortfolios(portfoliosWithCpvs)
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

  // Fetch company certifications when company is available
  // These are loaded for display only - they won't be updated/deleted during onboarding
  // useEffect(() => {
  //   const loadCompanyCertifications = async () => {
  //     if (user?.company_id) {
  //       const companyCerts = await fetchCompanyCertifications(user.company_id)
  //       // Mark existing certifications so we know not to update/delete them
  //       const existingCerts = companyCerts.map(cert => ({
  //         ...cert,
  //         isExisting: true // Flag to indicate this is from database
  //       }))
  //       setCompanyCertifications(existingCerts)
  //     }
  //   }
  //   if (user?.company_id) {
  //     loadCompanyCertifications()
  //   }
  // }, [user?.company_id])



  // Fetch company data when user is available
  useEffect(() => {
    if (user?.company_id) {
      getCompany(user.company_id)
      fetchCompanyCertifications(user.company_id)
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
        contract_range: company.contract_range || '€50k – €250k',
        // Certifications are loaded separately from company_certifications table
        primary_goal: Array.isArray(company.primary_goal) ? company.primary_goal : (company.primary_goal ? [company.primary_goal] : []),
        target_tenders: company.target_tenders || '',
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

  // Handle certification selection change
  // Users can add/remove certifications locally, but only new ones will be saved
  const handleCertificationChange = (details) => {
    const selectedCertIds = details.value || []
    
    setCompanyCertifications(prev => {
      const currentCertIds = prev.map(c => c.certification_id)
      
      // Find newly added certifications
      const newCertIds = selectedCertIds.filter(id => !currentCertIds.includes(id))
      
      // Find removed certifications (only remove locally, not from database)
      const removedCertIds = currentCertIds.filter(id => !selectedCertIds.includes(id))
      
      // Remove deleted certifications (local only - won't affect database)
      let updatedCerts = prev.filter(c => !removedCertIds.includes(c.certification_id))
      
      // Add new certifications with default status (these will be saved)
      newCertIds.forEach(certId => {
        updatedCerts.push({
          certification_id: certId,
          status: 'certified',
          notes: '',
          isExisting: false 
        })
      })
      
      return updatedCerts
    })
  }

  // Handle certification status change
  const handleCertificationStatusChange = (certificationId, status) => {
    setCompanyCertifications(prev =>
      prev.map(cert =>
        cert.certification_id === certificationId
          ? { ...cert, status }
          : cert
      )
    )
  }

  // Handle certification notes change (for equivalent certifications)
  const handleCertificationNotesChange = (certificationId, notes) => {
    setCompanyCertifications(prev =>
      prev.map(cert =>
        cert.certification_id === certificationId
          ? { ...cert, notes }
          : cert
      )
    )
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
        value_band: '€50k – €250k',
        description: '',
        cpvs: [],
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
      newErrors.region = 'Company location is required'
    }
    
    // KVK number is optional, but if provided, must be valid format
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
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    
    if (!formData.primary_goal || formData.primary_goal.length === 0) {
      newErrors.primary_goal = 'Primary goal is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newPortfolioErrors = {}
    
    // Only validate portfolios that have been started (have at least a title)
    // Empty portfolios are allowed - portfolio step is optional
    portfolios.forEach((portfolio, index) => {
      const hasTitle = portfolio.title && portfolio.title.trim() !== ''
      
      // If portfolio has been started (has title), validate all required fields
      if (hasTitle) {
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
          newPortfolioErrors[`portfolio_${index}_value_band`] = 'Project value range is required'
        }
      }
      // If no title, portfolio is considered empty and not validated (optional)
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

  // Save portfolios - only create new ones during onboarding
  // Only saves portfolios that have been started (have a title)
  const savePortfolios = async (companyId) => {
    // Only create new portfolios that have been started (have a title)
    const portfoliosToCreate = portfolios
      .filter(p => (!p.id || p.isNew) && p.title?.trim())

    await createPortfolios(companyId, portfoliosToCreate)
  }



  // Save company certifications to company_certifications table
  // Only inserts new certifications during onboarding (no updates or deletes)
  // Uses companyCertifications state which already has isExisting flag
  const saveCompanyCertifications = async (companyId) => {
    if (!companyId || !companyCertifications || companyCertifications.length === 0) {
      return
    }

    // Filter to only new certifications (not marked as existing)
    const newCertifications = companyCertifications.filter(
      cert => !cert.isExisting
    )

    if (newCertifications.length === 0) {
      return // No new certifications to add
    }

    // Insert only new certifications
    const insertData = newCertifications.map(cert => ({
      company_id: companyId,
      certification_id: cert.certification_id,
      status: cert.status || 'certified',
      notes: cert.notes || null
    }))

    const { error } = await supabase
      .from('company_certifications')
      .insert(insertData)

    if (error) {
      throw new Error(`Failed to save certifications: ${error.message}`)
    }
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
      // Step 2: Save company certifications
      await saveCompanyCertifications(user.company_id)
      // Step 3: Update company table AFTER portfolio and certifications are saved
      const companyUpdateData = {
        is_onboarded: true,
        region: formData.region || null,
        region_interest: Array.isArray(formData.region_interest) && formData.region_interest.length > 0 ? formData.region_interest : null,
        cpvs: Array.isArray(formData.cpvs) && formData.cpvs.length > 0 ? formData.cpvs : null,
        kvk_number: formData.kvk_number || null,
        worker_size: formData.workerSize || null,
        contract_type: Array.isArray(formData.contract_type) && formData.contract_type.length > 0 ? formData.contract_type : null,
        contract_range: formData.contract_range || null,
        primary_goal: Array.isArray(formData.primary_goal) && formData.primary_goal.length > 0 ? formData.primary_goal : null,
        target_tenders: formData.target_tenders || null,
        company_website: formData.company_website || null,
        uea_ready: formData.uea_ready || false,
        match_ready: formData.match_ready || false,
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
        router.push('/app/profile')
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
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
       
        style={{
          background: "linear-gradient(135deg, #f7f7f7 0%, #efefef 50%, #fafafa 100%)",
          position: "relative"
        }}
      >
        {/* Decorative background elements */}
        <Box
          position="absolute"
          top="10%"
          left="10%"
          w="300px"
          h="300px"
          borderRadius="full"
          style={{
            background: "linear-gradient(135deg, rgba(76, 187, 23, 0.1) 0%, rgba(31, 106, 225, 0.1) 100%)",
            filter: "blur(80px)",
            zIndex: 0
          }}
        />
        <Box
          position="absolute"
          bottom="10%"
          right="10%"
          w="250px"
          h="250px"
          borderRadius="full"
          style={{
            background: "linear-gradient(135deg, rgba(31, 106, 225, 0.1) 0%, rgba(107, 78, 255, 0.1) 100%)",
            filter: "blur(80px)",
            zIndex: 0
          }}
        />

        <Box 
          w="full" 
          maxW="500px" 
          position="relative"
          zIndex={1}
        >
          <Box
            bg="white"
            p="10"
            borderRadius="2xl"
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)"
            textAlign="center"
            style={{
              backdropFilter: "blur(10px)",
            }}
          >
            <VStack gap="6">
              <Box
                w="80px"
                h="80px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 8px 24px rgba(76, 187, 23, 0.3)"
                style={{
                  background: "linear-gradient(135deg, #4CBB17 0%, #3a9a12 100%)"
                }}
              >
                <LuCheck style={{ width: "40px", height: "40px", color: "white" }} />
              </Box>
              <Box>
                <Heading size="xl" mb="2" fontWeight="700" color="#1c1c1c">
                  You are good to go!
                </Heading>
                <Text color="#333">
                  Your onboarding is complete. You can now start using the platform.
                </Text>
              </Box>
              <Button
                type="button"
                onClick={() => router.push('/app/profile')}
                size="md"
                style={{
                  background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                  color: "white",
                  fontWeight: "600",
                  padding: "14px 24px",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 14px rgba(31, 106, 225, 0.3)",
                  marginTop: "8px"
                }}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(31, 106, 225, 0.4)"
                }}
                _active={{
                  transform: "translateY(0)"
                }}
              >
                Go to Dashboard
                <LuArrowRight style={{ width: "16px", height: "16px", marginLeft: "8px" }} />
              </Button>
            </VStack>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
       p={6}
      style={{
        background: "linear-gradient(135deg, #f7f7f7 0%, #efefef 50%, #fafafa 100%)",
        position: "relative"
      }}
    >
      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="10%"
        left="10%"
        w="300px"
        h="300px"
        borderRadius="full"
        style={{
          background: "linear-gradient(135deg, rgba(31, 106, 225, 0.1) 0%, rgba(107, 78, 255, 0.1) 100%)",
          filter: "blur(80px)",
          zIndex: 0
        }}
      />
      <Box
        position="absolute"
        bottom="10%"
        right="10%"
        w="250px"
        h="250px"
        borderRadius="full"
        style={{
          background: "linear-gradient(135deg, rgba(107, 78, 255, 0.1) 0%, rgba(31, 106, 225, 0.1) 100%)",
          filter: "blur(80px)",
          zIndex: 0
        }}
      />

      <Box 
        w="full" 
        maxW="900px" 
        position="relative"
        zIndex={1}
      >
        {/* Progress Indicator - Elegant */}
        <Box mb="6">
          <Box display="flex" alignItems="center" justifyContent="center">
            {steps.map((step, index) => (
              <Box key={step.id} display="flex" alignItems="center">
                <Box display="flex" flexDirection="column" alignItems="center" position="relative" zIndex={10}>
                  <Box
                    w="48px"
                    h="48px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderWidth="2px"
                    borderStyle="solid"
                    transition="all 0.3s ease"
                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
                    style={{
                      background: currentStep > step.id
                        ? "linear-gradient(135deg, #4CBB17 0%, #3a9a12 100%)"
                        : currentStep === step.id
                          ? "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)"
                          : "white",
                      borderColor: currentStep >= step.id ? "#1f6ae1" : "#d1d5db",
                      color: currentStep >= step.id ? "white" : "#9ca3af"
                    }}
                  >
                    {currentStep > step.id ? (
                      <LuCheck style={{ width: "20px", height: "20px" }} />
                    ) : (
                      <Box style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {step.icon}
                      </Box>
                    )}
                  </Box>
                  <Box mt="2" textAlign="center" maxW="120px">
                    <Text
                      fontSize="xs"
                      fontWeight="600"
                      transition="all 0.3s"
                      style={{
                        color: currentStep >= step.id ? "#1c1c1c" : "#9ca3af"
                      }}
                    >
                      {step.title}
                    </Text>
                    <Text
                      fontSize="2xs"
                      mt="0.5"
                      style={{
                        color: currentStep >= step.id ? "#666" : "#9ca3af"
                      }}
                    >
                      {step.description}
                    </Text>
                  </Box>
                </Box>
                {index < steps.length - 1 && (
                  <Box position="relative" mx="4" display="flex" alignItems="center">
                    <Box
                      h="2px"
                      w="80px"
                      borderRadius="full"
                      overflow="hidden"
                      bg="#efefef"
                    >
                      <Box
                        h="100%"
                        borderRadius="full"
                        transition="all 0.5s ease"
                        style={{
                          width: currentStep > step.id ? "100%" : "0%",
                          background: "linear-gradient(90deg, #4CBB17 0%, #3a9a12 100%)"
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Form Card - Elegant */}
        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)"
          overflow="hidden"
          position="relative"
          style={{
            backdropFilter: "blur(10px)",
          }}
        >
          {isSubmitting && <LoadingOverlay message="Saving your information..." />}
          <Box p={{ base: "6", md: "8" }} data-protonpass-form="">
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <Box>
                <VStack gap="5" align="stretch">
                  <Box mb="2">
                    <HStack gap="2" alignItems="center" mb="2">
                      <Heading 
                        size="xl" 
                        fontWeight="700"
                        style={{ 
                          background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text"
                        }}
                      >
                        {steps[0].title}
                      </Heading>
                      <Tooltip content="This information helps us match you with relevant tenders and assess your eligibility for opportunities.">
                      <BsExclamationCircle size={20} />
                      </Tooltip>
                    </HStack>
                    <Text fontSize="sm" color="#666">
                      {steps[0].description}
                    </Text>
                  </Box>
                  <VStack gap="4" align="stretch">
                    {/* Basic Information Card */}
                    <Box
                      borderRadius="xl"
                      p="5"
                      bg="#fafafa"
                      borderWidth="1px"
                      borderStyle="solid"
                      borderColor="#efefef"
                    >
                      <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">
                        Basic Information
                      </Text>
                      <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
                        <Box>
                          <SelectField
                            label="Company location"
                            items={regions}
                            placeholder="Select your company location"
                            value={formData.region ? [formData.region] : []}
                            onValueChange={handleSelectChange('region')}
                            required
                            invalid={!!errors.region}
                            errorText={errors.region}
                          />
                          <Text fontSize="xs" color="#666" mt="1">
                            Where your company is based
                          </Text>
                        </Box>
                        <Box>
                          <InputField
                            label="KVK Number"
                            placeholder="Enter 8-digit KVK number (optional)"
                            value={formData.kvk_number}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 8)
                              updateFormData('kvk_number', value)
                            }}
                            invalid={!!errors.kvk_number}
                            errorText={errors.kvk_number}
                            maxLength={8}
                            helperText="Used to identify your company and improve matching accuracy. You can add or update this later."
                          />
                        
                        </Box>
                      </Box>
                      
                      <Box mt="4">
                        <MultiSelectField
                          label="Tender interest regions"
                          items={regions}
                          placeholder="Select regions where you want to find tenders"
                          value={formData.region_interest}
                          onValueChange={handleMultiSelectChange('region_interest')}
                        />
                        <Text fontSize="xs" color="#666" mt="1">
                          Regions where you want to find tenders
                        </Text>
                      </Box>
                    </Box>

                    {/* Worker Size Card */}
                    <Box
                      borderRadius="xl"
                      p="5"
                      bg="#fafafa"
                      borderWidth={errors.workerSize ? "2px" : "1px"}
                      borderStyle="solid"
                      borderColor={errors.workerSize ? "#ef4444" : "#efefef"}
                    >
                      <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">
                        Company Size
                      </Text>
                      <Box>
                        <Text fontWeight="medium" fontSize="sm" mb="2" className="!text-black">
                          Worker Size
                          <Text as="span" color="red.500" ml="1">*</Text>
                        </Text>
                        <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="3" mt="2">
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
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 12px rgba(31, 106, 225, 0.15)',
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
                    </Box>

                    {/* Business Details Card */}
                    <Box
                      borderRadius="xl"
                      p="5"
                      bg="#fafafa"
                      borderWidth="1px"
                      borderStyle="solid"
                      borderColor="#efefef"
                    >
                      <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">
                        Business Details
                      </Text>
                      <VStack gap="4" align="stretch">
                        <Box>
                          <MultiSelectField
                            label="CPV categories of interest"
                            items={cpvs}
                            placeholder="Search CPVs such as IT services, construction, consultancy"
                            value={formData.cpvs}
                            onValueChange={handleMultiSelectChange('cpvs')}
                            required
                            invalid={!!errors.cpvs}
                            errorText={errors.cpvs}
                          />
                          <Text fontSize="xs" color="#666" mt="1">
                            Select the CPV categories you want to receive tenders for
                          </Text>
                        </Box>
                        <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
                          <Box>
                            <MultiSelectField
                              label="Type of contract"
                              items={contractTypes}
                              placeholder="Select contract type"
                              value={formData.contract_type}
                              onValueChange={handleMultiSelectChange('contract_type')}
                              required
                              invalid={!!errors.contract_type}
                              errorText={errors.contract_type}
                            />
                            <Text fontSize="xs" color="#666" mt="1">
                              Select the types of public contracts you are interested in
                            </Text>
                          </Box>
                          <InputField
                            label="Company Website"
                            type="url"
                            placeholder="https://www.example.com (optional)"
                            value={formData.company_website}
                            onChange={(e) => updateFormData('company_website', e.target.value)}
                          />
                        </Box>
                        <Box>
                          <SliderField
                            label="Typical contract values of interest"
                            value={getContractRangeIndex(formData.contract_range)}
                            onChange={(value) => updateFormData('contract_range', contractRangeLabels[value] || contractRangeLabels[0])}
                            min={0}
                            max={3}
                            step={1}
                            required
                            maxW="100%"
                            formatValue={formatContractRange}
                          />
                          <Text fontSize="xs" color="#666" mt="1">
                            This is used to match publicly published tenders
                          </Text>
                          {errors.contract_range && (
                            <Text fontSize="xs" color="red.500" mt="1">{errors.contract_range}</Text>
                          )}
                        </Box>
                      </VStack>
                    </Box>
                  </VStack>
                </VStack>
              </Box>
            )}

            {/* Step 2: Company Details */}
            {currentStep === 2 && (
              <Box>
                <VStack gap="5" align="stretch">
                  <Box mb="2">
                    <HStack gap="2" alignItems="center" mb="2">
                      <Heading 
                        size="xl" 
                        fontWeight="700"
                        style={{ 
                          background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text"
                        }}
                      >
                        {steps[1].title}
                      </Heading>
                      <Tooltip content="This information helps us match you with relevant tenders and partners based on your goals and capabilities.">
                      <BsExclamationCircle size={20} />
                      </Tooltip>
                    </HStack>
                    <Text fontSize="sm" color="#666">
                      {steps[1].description}
                    </Text>
                  </Box>
                  <VStack gap="4" align="stretch">
                    {/* Certification & Goals Card */}
                    <Box
                      borderRadius="xl"
                      p="5"
                      bg="#fafafa"
                      borderWidth="1px"
                      borderStyle="solid"
                      borderColor="#efefef"
                    >
                      <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">
                        Certification & Goals
                      </Text>
                      <VStack gap="4" align="stretch">
                        <Box>
                          <MultiSelectField
                            label="Relevant certifications (optional)"
                            items={certifications}
                            placeholder="Select certifications"
                            value={companyCertifications?.map(c => c.certification_id) || []}
                            onValueChange={handleCertificationChange}
                            groupBy={(item) => item.category || 'Other'}
                          />
                          <Text fontSize="xs" color="#666" mt="1">
                            Select certifications your organization holds that are commonly requested in public tenders.
                          </Text>
                          
                          {/* Inline status selectors for selected certifications */}
                          {companyCertifications && companyCertifications.length > 0 && (
                            <Box mt="4" p="4" bg="#f9fafb" borderRadius="md" borderWidth="1px" borderColor="#e5e7eb">
                              <VStack gap="3" align="stretch">
                                {companyCertifications?.map((cert) => {
                                  const certInfo = certifications.find(c => c.id === cert.certification_id)
                                  const isEquivalent = certInfo?.is_equivalent || false
                                  
                                  return (
                                    <Box key={cert.certification_id} p="3" bg="white" borderRadius="md" borderWidth="1px" borderColor="#e5e7eb">
                                      <HStack gap="3" align="flex-start">
                                        <Box flex="1">
                                          <Text fontSize="sm" fontWeight="600" mb="1">
                                            {certInfo?.name || 'Unknown Certification'}
                                            {certInfo?.code && (
                                              <Text as="span" fontSize="xs" color="#666" ml="2" fontWeight="400">
                                                ({certInfo.code})
                                              </Text>
                                            )}
                                          </Text>
                                          {certInfo?.description && (
                                            <Text fontSize="xs" color="#666" mb="2">
                                              {certInfo.description}
                                            </Text>
                                          )}
                                        </Box>
                                        <Box minW="150px">
                                          <SelectField
                                            items={[
                                              { id: 'certified', name: 'Certified' },
                                              { id: 'in_progress', name: 'In progress' },
                                              { id: 'self_declared', name: 'Self-declared' }
                                            ]}
                                            placeholder="Select status"
                                            value={cert.status ? [cert.status] : ['certified']}
                                            onValueChange={(details) => handleCertificationStatusChange(cert.certification_id, details.value[0] || 'certified')}
                                          />
                                        </Box>
                                      </HStack>
                                      {isEquivalent && (
                                        <Box mt="2">
                                          <InputField
                                            label="Specify equivalent certification"
                                            placeholder="e.g., ISO 9001 equivalent"
                                            value={cert.notes || ''}
                                            onChange={(e) => handleCertificationNotesChange(cert.certification_id, e.target.value)}
                                            helperText="Please specify the equivalent certification you hold"
                                          />
                                        </Box>
                                      )}
                                    </Box>
                                  )
                                })}
                                <Text fontSize="xs" color="#666" mt="2" fontStyle="italic">
                                  Certification status is self-declared and used for matching and eligibility indication only. Formal proof is provided during tender submission.
                                </Text>
                              </VStack>
                            </Box>
                          )}
                        </Box>
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
                        <SelectField
                          label="Which tenders do you usually target?"
                          items={targetTendersOptions}
                          placeholder="Select target tenders"
                          value={formData.target_tenders ? [formData.target_tenders] : []}
                          onValueChange={handleSelectChange('target_tenders')}
                        />
                      </VStack>
                    </Box>
                    {/* Status Card */}
                    <Box
                      borderRadius="xl"
                      p="5"
                      bg="#fafafa"
                      borderWidth="1px"
                      borderStyle="solid"
                      borderColor="#efefef"
                    >
                      <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">
                        Status & Readiness
                      </Text>
                      <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
                        <Toggle
                          label="UEA Ready"
                          checked={formData.uea_ready}
                          onCheckedChange={(details) => updateFormData('uea_ready', details.checked)}
                          helperText="Certification is UEA ready"
                        />
                        <Toggle
                          label="Open to partner matching"
                          checked={formData.match_ready}
                          onCheckedChange={(details) => updateFormData('match_ready', details.checked)}
                          helperText="Enable this if you want to be matched with other companies for tenders where collaboration is required. You remain in control and can decide whether to share details."
                        />
                      </Box>
                    </Box>
                  </VStack>
                </VStack>
              </Box>
            )}

            {/* Step 3: Portfolio */}
            {currentStep === 3 && (
              <Box>
                <VStack gap="5" align="stretch">
                  <Box mb="2" display="flex" justifyContent="space-between" alignItems="flex-start" gap="4">
                    <Box flex="1">
                      <HStack gap="2" alignItems="center" mb="2">
                        <Heading 
                          size="xl" 
                          fontWeight="700"
                          display="flex"
                          alignItems="center"
                          gap="2"
                          style={{ 
                            background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text"
                          }}
                        >
                          Showcase your best work
                          <Text as="span" fontWeight="600" color="#1f6ae1">
                            ({portfolios.length} of {MAX_PORTFOLIOS})
                          </Text>
                        </Heading>
                        <Tooltip content="This information helps us match you with relevant tenders and partners by showcasing your capabilities and experience.">
                          <BsExclamationCircle size={20} />
                        </Tooltip>
                      </HStack>
                      <Text fontSize="sm" color="#666">
                        {steps[2].description}
                      </Text>
                      <Box mt="2" p="3" borderRadius="md" bg="#e3f2fd" borderWidth="1px" borderColor="#90caf9">
                        <Text fontSize="xs" color="#1565c0" fontWeight="500">
                          <Text as="span" fontWeight="600">Optional:</Text> You can add or improve your portfolio later to strengthen your profile and partner matches.
                        </Text>
                      </Box>
                    </Box>
                    <IconButton
                      type="button"
                      variant="solid"
                      onClick={addPortfolio}
                      size="sm"
                      disabled={portfolios.length >= MAX_PORTFOLIOS}
                      style={{
                        background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                        color: "white",
                        boxShadow: "0 4px 12px rgba(31, 106, 225, 0.3)"
                      }}
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 16px rgba(31, 106, 225, 0.4)"
                      }}
                      _disabled={{
                        opacity: 0.5,
                        cursor: "not-allowed"
                      }}
                      aria-label="Add new portfolio"
                    >
                      <LuPlus />
                    </IconButton>
                  </Box>
                  <VStack gap="4"  align="stretch">
                    {portfolios
                      .map((portfolio, index) => ({ portfolio, index }))
                      .map(({ portfolio, index }, displayIndex) => (
                        <Box
                          key={portfolio.id || index}
                          borderRadius="xl"
                          overflow="hidden"
                          transition="all 0.2s"
                          bg={openPortfolioIndex === index ? "#fafafa" : "white"}
                          borderWidth="1px"
                          borderStyle="solid"
                          borderColor={openPortfolioIndex === index ? "#1f6ae1" : "#efefef"}
                          _hover={{
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                          }}
                        >
                          <Collapsible
                            title={`Portfolio Project ${displayIndex + 1}`}
                            open={openPortfolioIndex === index}
                            onOpenChange={() => handlePortfolioToggle(index)}
                            className="border-0"
                          >
                            <Box p="4" pt="2">
                              <Box display="flex" alignItems="center" justifyContent="space-between" mb="3" pb="2">
                                <Box display="flex" alignItems="center" gap="2">
                                  <Box
                                    w="24px"
                                    h="24px"
                                    borderRadius="md"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg="rgba(31, 106, 225, 0.1)"
                                  >
                                    <LuBriefcase style={{ width: "12px", height: "12px", color: "#1f6ae1" }} />
                                  </Box>
                                  <Text fontSize="sm" fontWeight="600" color="#333">
                                    Project Details
                                  </Text>
                                </Box>
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
                                    colorScheme="red"
                                  >
                                    <LuTrash2 />
                                  </IconButton>
                                )}
                              </Box>
                              <VStack gap="4" align="stretch">
                                <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
                                  <InputField
                                    label="Title"
                                    placeholder="Enter project title"
                                    value={portfolio.title}
                                    onChange={(e) => updatePortfolio(index, 'title', e.target.value)}
                                    required
                                    invalid={!!portfolioErrors[`portfolio_${index}_title`]}
                                    errorText={portfolioErrors[`portfolio_${index}_title`]}
                                  />
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
                                </Box>
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
                                  <Box>
                                    <SliderField
                                      label="Project value range"
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
                                  </Box>
                                  <MultiSelectField
                                    label="CPVS Categories"
                                    items={cpvs}
                                    placeholder="Select CPVS categories for this project"
                                    value={portfolio.cpvs || []}
                                    onValueChange={(details) => updatePortfolio(index, 'cpvs', details.value || [])}
                                  />
                                  <InputField
                                    label="Relevant experience description"
                                    placeholder="Enter relevant experience description"
                                    value={portfolio.description}
                                    onChange={(e) => updatePortfolio(index, 'description', e.target.value)}
                                    helperText="Briefly describe the scope and activities of this project, focusing on aspects relevant for tender experience and eligibility"
                                  />
                              </VStack>
                            </Box>
                          </Collapsible>
                        </Box>
                      ))}

                  </VStack>
                </VStack>
              </Box>
            )}

            {/* Navigation Buttons - Elegant */}
            <Box
              borderTopWidth="1px"
              borderTopStyle="solid"
              borderTopColor="#efefef"
              px="6"
              py="4"
              mt="4"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap="3"
              bg="#fafafa"
            >
              <Box display="flex" alignItems="center" gap="3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isFirstStep}
                  style={{
                    borderColor: "#d1d5db",
                    color: "#374151"
                  }}
                  _hover={{
                    bg: "#f9fafb"
                  }}
                  _disabled={{
                    opacity: 0.4,
                    cursor: "not-allowed"
                  }}
                >
                  <LuArrowLeft />
                  Back
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push('/app/profile')}
                  style={{
                    color: "#6b7280"
                  }}
                  _hover={{
                    bg: "#f3f4f6",
                    color: "#374151"
                  }}
                >
                  <LuForward style={{ width: "16px", height: "16px" }} />
                  Skip for now
                </Button>
              </Box>
              <Box display="flex" alignItems="center" gap="2">
                <Box
                  w="6px"
                  h="6px"
                  borderRadius="full"
                  bg="#1f6ae1"
                  style={{
                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                  }}
                />
                <Text fontSize="xs" color="#333" fontWeight="500">
                  Step {currentStep} of {steps.length}
                </Text>
              </Box>
              {isLastStep ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="md"
                  style={{
                    background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                    color: "white",
                    fontWeight: "600",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 14px rgba(31, 106, 225, 0.3)"
                  }}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(31, 106, 225, 0.4)"
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                  _disabled={{
                    opacity: 0.5,
                    cursor: "not-allowed"
                  }}
                >
                  <LuCheck style={{ width: "16px", height: "16px", marginRight: "8px" }} />
                  {isSubmitting ? 'Saving...' : 'Complete'}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  size="md"
                  style={{
                    background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                    color: "white",
                    fontWeight: "600",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 14px rgba(31, 106, 225, 0.3)"
                  }}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(31, 106, 225, 0.4)"
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                >
                  Next
                  <LuArrowRight style={{ width: "16px", height: "16px", marginLeft: "8px" }} />
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
