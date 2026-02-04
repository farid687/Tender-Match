'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

import { useCompany } from '@/hooks/useCompany'
import { toaster } from '@/elements/toaster'
import { Button } from '@/elements/button'
import { IconButton } from '@/elements/icon-button'
import { InputField } from '@/elements/input'
import { TextareaField } from '@/elements/textarea'
import { SelectField } from '@/elements/select'
import { MultiSelectField } from '@/elements/multi-select'
import { SliderField } from '@/elements/slider'
import { Toggle } from '@/elements/toggle'
import { Collapsible } from '@/elements/collapsible'
import { TabButton } from '@/elements/tab-button'
import { YearPicker } from '@/elements/year-picker'
import { Box, Text, Heading, VStack, HStack } from '@chakra-ui/react'
import {  LuUserRound, LuBriefcase, LuPlus, LuTrash2, LuSave,  } from 'react-icons/lu'
import { BsExclamationCircle } from 'react-icons/bs'
import { Tooltip } from '@/elements/tooltip'
import { passwordStrength } from 'check-password-strength'
import { useAuth  } from '@/hooks/useAuth'
import { clientTypes, contractTypes, MAX_PORTFOLIOS, primaryGoalOptions, targetTendersOptions, formatCurrency, parseContractRange, formatValueBand, CONTRACT_VALUE_MIN, CONTRACT_VALUE_MAX, parseCustomContractRange } from '../onboarding/variables'
import { Loading, LoadingOverlay } from '@/elements/loading'
import { useGlobal } from '@/context'

export default function ProfilePage() {
  const { user, company, loading: authLoading } = useGlobal()
  const { getCompany } = useCompany()
  const auth= useAuth()
  const [activeTab, setActiveTab] = useState('company-info')
  const [certifications, setCertifications] = useState([])
  const [regions, setRegions] = useState([])
  const [cpvs, setCpvs] = useState([])
  const [openPortfolioIndex, setOpenPortfolioIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", password: "", confirmPassword: "" })
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1: Company Profile
    region: '',
    region_interest: [],
    workerSize: '',
    kvk_number: '',
    company_website: '',
    cpvs: [],
    contract_type: [],
    contract_range: 50000,

    // Step 2: Company Details
    primary_goal: [],
    target_tenders: '',
    mandatory_exclusion: false,
    discretionary_exclusion: false,
    match_ready: false,
  })

  const [portfolios, setPortfolios] = useState([
    {  
      title: '',
      client_type: '',
      year: '',
      value_band: 50000,
      description: '',
      cpvs: [],
    }
  ])

  // Validation errors state
  const [errors, setErrors] = useState({})
  const [portfolioErrors, setPortfolioErrors] = useState({})
  const [companyCertifications, setCompanyCertifications] = useState([]) 

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
        return
      }

      const mapped = (data ?? []).map((c) => ({
        id: c.id,
        certification_id: c.certification_id,
        status: c.status ?? 'certified',
        notes: c.notes ?? '',
        isExisting: true
      }))
      setCompanyCertifications(mapped)
    } catch (err) {
      console.error('Exception fetching company certifications:', err)
    }
  }

  // Fetch regions from Supabase
  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('id, name, province')
        .order('name', { ascending: true })
      
      if (error) {
        console.error('Error fetching regions:', error)
        setRegions([])
      } else {
        const mappedRegions = (data || []).map(region => ({
          id: region.id,
          name: region.name,
          province: region.province
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
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching portfolio data:', error)
        return
      }

      if (data && data.length > 0) {
        const portfoliosWithCpvs = data.map(portfolio => {
          // Handle year - convert to string if number, or keep as string
          let yearValue = portfolio.year
          if (typeof yearValue === 'number') {
            yearValue = yearValue.toString()
          } else if (typeof yearValue === 'string' && yearValue.includes('-')) {
            // If it's a date string, extract just the year
            yearValue = new Date(yearValue).getFullYear().toString()
          }
          return {
            ...portfolio,
            year: yearValue || '',
            cpvs: Array.isArray(portfolio.cpvs) ? portfolio.cpvs : (portfolio.cpvs ? [portfolio.cpvs] : []),
            value_band: typeof portfolio.value_band === 'number' ? portfolio.value_band : parseContractRange(portfolio.value_band)
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
          value_band: 50000,
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
        contract_range: company.contract_range != null ? parseContractRange(company.contract_range) : 50000,
        // Certifications are loaded separately from company_certifications table
        primary_goal: Array.isArray(company.primary_goal) ? company.primary_goal : (company.primary_goal ? [company.primary_goal] : []),
        target_tenders: company.target_tenders || '',
        mandatory_exclusion: company.mandatory_exclusion || false,
        discretionary_exclusion: company.discretionary_exclusion || false,
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

  // Handle certification selection change
  // Users can add new certifications and update status, but cannot delete existing ones
  const handleCertificationChange = (details) => {
    const selectedCertIds = details.value || []
    
    setCompanyCertifications(prev => {
      const currentCertIds = prev.map(c => c.certification_id)
      
      // Get all existing certification IDs (these cannot be removed)
      const existingCertIds = prev.filter(c => c.isExisting).map(c => c.certification_id)
      
      // Ensure existing certifications are always included in selection
      const finalSelectedIds = [...new Set([...selectedCertIds, ...existingCertIds])]
      
      // Find newly added certifications (not in current list)
      const newCertIds = finalSelectedIds.filter(id => !currentCertIds.includes(id))
      
      // Find removed certifications - but only allow removing newly added ones (not existing)
      const removedCertIds = currentCertIds.filter(id => !finalSelectedIds.includes(id))
      
      // Start with all existing certifications (they must always be kept)
      let updatedCerts = prev.filter(c => c.isExisting)
      
      // Add back newly added certifications that weren't removed
      prev.filter(c => !c.isExisting && !removedCertIds.includes(c.certification_id))
        .forEach(cert => updatedCerts.push(cert))
      
      // Add new certifications with default status
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
        value_band: 50000,
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
          value_band: portfolioData.value_band ?? null,
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
      value_band: portfolio.value_band ?? null,
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
      newErrors.region = 'Company location (province) is required'
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

    const contractRangeNum = typeof formData.contract_range === 'number' ? formData.contract_range : parseCustomContractRange(formData.contract_range)
    if (contractRangeNum == null || contractRangeNum < CONTRACT_VALUE_MIN || contractRangeNum > CONTRACT_VALUE_MAX) {
      newErrors.contract_range = 'Enter a contract value (use the slider or enter a value between €0 and €50m)'
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

      const yearValue = portfolio.year?.toString().trim() || ''
      if (!yearValue) {
        newPortfolioErrors[`portfolio_${index}_year`] = 'Year is required'
      } else {
        const year = parseInt(yearValue, 10)
        const minYear = 1900
        const maxYear = new Date().getFullYear() + 10
        
        if (isNaN(year)) {
          newPortfolioErrors[`portfolio_${index}_year`] = 'Invalid year format'
        } else if (year < minYear || year > maxYear) {
          newPortfolioErrors[`portfolio_${index}_year`] = `Year must be between ${minYear} and ${maxYear}`
        }
      }

      const valueBandNum = typeof portfolio.value_band === 'number' ? portfolio.value_band : parseCustomContractRange(portfolio.value_band)
      if (valueBandNum == null || valueBandNum < CONTRACT_VALUE_MIN || valueBandNum > CONTRACT_VALUE_MAX) {
        newPortfolioErrors[`portfolio_${index}_value_band`] = 'Enter a project value (use the slider or enter a value between €0 and €50m)'
      }
    })

    setErrors(newErrors)
    setPortfolioErrors(newPortfolioErrors)

    // Return true if no errors
    return Object.keys(newErrors).length === 0 && Object.keys(newPortfolioErrors).length === 0
  }

  // Save company certifications to company_certifications table
  // Users can add new certifications and update status/notes, but cannot delete existing ones
  // const saveCompanyCertifications = async (companyId) => {
  //   if (!companyId) return


  //   const existingCertIds = companyCertifications?.map(c => c?.certification_id)
    
  //   // Find new certifications (not in existing) - only newly added ones
  //   const newCertifications = companyCertifications?.filter(
  //     cert => !existingCertIds.includes(cert.certification_id)
  //   )

  //   // Insert new certifications
  //   if (newCertifications.length > 0) {
  //     const insertData = newCertifications.map(cert => ({
  //       company_id: companyId,
  //       certification_id: cert.certification_id,
  //       status: cert.status || 'certified',
  //       notes: cert.notes || null
  //     }))

  //     const { error: insertError } = await supabase
  //       .from('company_certifications')
  //       .insert(insertData)

  //     if (insertError) {
  //       throw new Error(`Failed to save certifications: ${insertError.message}`)
  //     }
  //   }

  //   // Update existing certifications (status or notes may have changed)
  //   // Only update certifications that exist in the database
  //   const certsToUpdate = companyCertifications.filter(cert => 
  //     existingCertIds.includes(cert.certification_id)
  //   )

  //   if (certsToUpdate.length > 0) {
  //     const updatePromises = certsToUpdate.map(cert => {
  //       const existingCert = existingCerts?.find(ec => ec.certification_id === cert.certification_id)
  //       if (!existingCert) return null

  //       return supabase
  //         .from('company_certifications')
  //         .update({
  //           status: cert.status || 'certified',
  //           notes: cert.notes || null
  //         })
  //         .eq('id', existingCert.id)
  //     })

  //     const updateResults = await Promise.all(updatePromises.filter(Boolean))
  //     const updateError = updateResults.find(result => result.error)
      
  //     if (updateError) {
  //       throw new Error(`Failed to update certifications: ${updateError.error.message}`)
  //     }
  //   }
  // }

  const saveCompanyCertifications = async (companyId) => {
    if (!companyId || !Array.isArray(companyCertifications)) return
  
    const inserts = []
    const updates = []
  
    for (const cert of companyCertifications) {
      if (!cert?.certification_id) continue
  
      const normalized = {
        company_id: companyId,
        certification_id: cert.certification_id,
        status: cert.status ?? 'certified',
        notes: cert.notes || null
      }
  
      // 🔹 NEW certification
      if (!cert.isExisting) {
        inserts.push(normalized)
        continue
      }
  
      // 🔹 EXISTING certification
      if (cert.id) {
        updates.push({ id: cert.id, status: normalized.status, notes: normalized.notes })
      }
    }

    // INSERT (bulk); .select() returns inserted rows so we can update state without a refetch
    if (inserts.length > 0) {
      const { data: insertedRows, error } = await supabase
        .from('company_certifications')
        .insert(inserts)
        .select('id, certification_id, status, notes')

      if (error) throw new Error(`Insert failed: ${error.message}`)

      setCompanyCertifications((prev) =>
        prev.map((c) => {
          if (c.id) return c
          const row = (insertedRows ?? []).find((r) => r.certification_id === c.certification_id)
          return row
            ? { id: row.id, certification_id: row.certification_id, status: row.status ?? 'certified', notes: row.notes ?? '', isExisting: true }
            : c
        })
      )
    }

    // UPDATE (per row by id)
    if (updates.length > 0) {
      const results = await Promise.all(
        updates.map((u) =>
          supabase
            .from('company_certifications')
            .update({ status: u.status, notes: u.notes })
            .eq('id', u.id)
        )
      )
      const err = results.find((r) => r.error)
      if (err) throw new Error(`Update failed: ${err.error?.message ?? err.message}`)
    }
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
      await saveCompanyCertifications(user.company_id)
      
      const companyUpdateData = {
        region: formData.region || null,
        region_interest: Array.isArray(formData.region_interest) && formData.region_interest.length > 0 ? formData.region_interest : null,
        cpvs: Array.isArray(formData.cpvs) && formData.cpvs.length > 0 ? formData.cpvs : null,
        worker_size: formData.workerSize || null,
        contract_type: Array.isArray(formData.contract_type) && formData.contract_type.length > 0 ? formData.contract_type : null,
        contract_range: formData.contract_range != null ? (typeof formData.contract_range === 'number' ? formData.contract_range : parseCustomContractRange(formData.contract_range)) : null,
        primary_goal: Array.isArray(formData.primary_goal) && formData.primary_goal.length > 0 ? formData.primary_goal : null,
        target_tenders: formData.target_tenders || null,
        company_website: formData.company_website || null,
        mandatory_exclusion: formData.mandatory_exclusion || false,
        discretionary_exclusion: formData.discretionary_exclusion || false,
        match_ready: formData.match_ready || false,
        // Note: kvk_number is NOT updated here as it is disabled
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

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  }

  const handlePasswordSubmit = async () => {
    if (!passwordForm.currentPassword?.trim()) {
      toaster.create({ title: "Enter your current password", type: "error" })
      return
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toaster.create({ title: "Passwords do not match", type: "error" })
      return
    }

    const strength = passwordForm.password ? passwordStrength(passwordForm.password) : null
    if (strength?.value === "Too weak") {
      toaster.create({ title: "Password is too weak", type: "error" })
      return
    }

    setIsUpdatingPassword(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email) {
        toaster.create({ title: "Session expired", description: "Please sign in again.", type: "error" })
        return
      }
      await auth.signIn(session.user.email, passwordForm.currentPassword)
      await auth.updatePassword(passwordForm.password)
      toaster.create({ title: "Password updated successfully", type: "success" })
      setPasswordForm({ currentPassword: "", password: "", confirmPassword: "" })
    } catch (error) {
      const msg = error?.message?.toLowerCase?.() ?? ""
      if (msg.includes("invalid") || msg.includes("credentials")) {
        toaster.create({ title: "Current password is incorrect", type: "error" })
      } else {
        toaster.create({ title: "Failed to update password", description: error.message, type: "error" })
      }
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const tabs = [
    {
      id: 'company-info',
      value: 'company-info',
      label: 'Company Profile',
      // leftIcon: <LuBuilding2 />,
      content: (
        <Box p={{ base: "3", md: "4" }}>
          <VStack gap="5" align="stretch">
            {/* Section Header */}
            <Box mb="2">
              <HStack gap="2" alignItems="center" mb="2">
                <Heading 
                  size={{ base: "lg", sm: "xl" }}
                  fontWeight="700"
                  style={{ 
                    background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  Company Profile
                </Heading>
                <Tooltip content="This information helps us match you with relevant tenders and assess your eligibility for opportunities.">
                  <BsExclamationCircle size={20} className='!text-gray-400' />
                </Tooltip>
              </HStack>
            </Box>
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
                    label="Company location (province)"
                    items={regions}
                    placeholder="Select your company location (province)"
                    value={formData.region ? [formData.region] : []}
                    onValueChange={handleSelectChange('region')}
                    groupBy={(region) => region.province || 'Other'}
                    required
                    invalid={!!errors.region}
                    errorText={errors.region}
                  />
                  <Text fontSize="xs" color="#666" mt="1">
                    Where your company is registered
                  </Text>
                </Box>
                <Box position="relative">
                  <InputField
                    label="KVK Number"
                    placeholder="8-digit KVK number"
                    value={formData.kvk_number}
                    disabled={true}
                    helperText="KVK number cannot be updated through profile settings"
                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                    invalid={!!errors.kvk_number}
                    errorText={errors.kvk_number}
                  />
                </Box>
              </Box>
              
              <Box mt="4">
                <MultiSelectField
                  label="Preferred regions"
                  items={regions}
                  placeholder="Where would you like to receive tenders?"
                  value={formData.region_interest}
                  onValueChange={handleMultiSelectChange('region_interest')}
                  groupBy={(region) => region.province || 'Other'}
                />
                <Text fontSize="xs" color="#666" mt="1">
                  Where would you like to receive tenders?
                </Text>
              </Box>
            </Box>

            {/* Company size Card */}
            <Box
              borderRadius="xl"
              p="5"
              bg="#fafafa"
              borderWidth={errors.workerSize ? "2px" : "1px"}
              borderStyle="solid"
              borderColor={errors.workerSize ? "#ef4444" : "#efefef"}
            >
              <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">
                Company size
              </Text>
              <Box>
                <Text fontWeight="medium" fontSize="sm" mb="2" style={{ color: '#1c1c1c' }}>
                  Company size
                  <Text as="span" color="red.500" ml="1">*</Text>
                </Text>
                <Box display="grid" gridTemplateColumns={{ base: "1fr", sm: "repeat(4, 1fr)" }} gap={{ base: 2, md: 3 }} mt="2">
                  {[
                    { id: 'small', label: 'Small', range: '1 to 10' },
                    { id: 'medium', label: 'Medium', range: '10 to 50' },
                    { id: 'large', label: 'Large', range: '50 to 100' },
                    { id: 'organization', label: 'Enterprise (100+)', range: '100+' },
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
                        p="3"
                        w="100%"
                        minW={0}
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
                          fontSize="lg"
                          mb="0.5"
                          color={isSelected ? '#1f6ae1' : '#333333'}
                          transition="all 0.2s"
                        >
                          <LuUserRound />
                        </Box>
                        <Text
                          fontWeight="semibold"
                          fontSize="xs"
                          color={isSelected ? '#1f6ae1' : '#1c1c1c'}
                          mb="0"
                          textAlign="center"
                          whiteSpace="normal"
                          wordBreak="break-word"
                        >
                          {size.label}
                        </Text>
                        <Text
                          fontSize="2xs"
                          color={isSelected ? '#1f6ae1' : '#333333'}
                          textAlign="center"
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
                    label="Business categories (CPV)"
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
                      label="Contract type"
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
                  <Box>
                    <InputField
                      label="Company website (optional)"
                      type="url"
                      placeholder="https://www.example.com (optional)"
                      value={formData.company_website}
                      onChange={(e) => updateFormData('company_website', e.target.value)}
                    />
                  </Box>
                </Box>
                <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr auto 1fr" }} gap="4" alignItems="start">
                    <SliderField
                      label="Typical contract value"
                      value={formData.contract_range != null ? Math.min(CONTRACT_VALUE_MAX, Math.max(CONTRACT_VALUE_MIN, Number(formData.contract_range))) : 50000}
                      onChange={(value) => updateFormData('contract_range', value)}
                      min={CONTRACT_VALUE_MIN}
                      max={CONTRACT_VALUE_MAX}
                      step={50000}
                      required
                      maxW="100%"
                      formatValue={formatValueBand}
                    />
                    <Text as="span" alignSelf="center" fontSize="sm" fontWeight="medium" color="gray.600">OR</Text>
                    <InputField
                      label="Or enter value manually (€)"
                      placeholder="e.g. 250000 or 1.5m"
                      value={formData.contract_range != null ? String(formData.contract_range) : ''}
                      onChange={(e) => {
                        const v = parseCustomContractRange(e.target.value)
                        updateFormData('contract_range', v ?? null)
                      }}
                      invalid={!!errors.contract_range}
                      errorText={errors.contract_range}
                    />
                  </Box>
                  <Text fontSize="xs" color="#666" mt="1">
                    This is used to match publicly published tenders (€0 – €50m)
                  </Text>
              </VStack>
            </Box>
          </VStack>
        </Box>
      ),
    },
    {
      id: 'company-details',
      value: 'company-details',
      label: 'Company Details',
      // leftIcon: <LuGlobe />,
      content: (
        <Box p={{ base: "3", md: "4" }}>
          <VStack gap="5" align="stretch">
            {/* Section Header */}
            <Box mb="2">
              <HStack gap="2" alignItems="center" mb="2">
                <Heading 
                  size={{ base: "lg", sm: "xl" }}
                  fontWeight="700"
                  style={{ 
                    background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  Company Details
                </Heading>
                <Tooltip content="This information helps us match you with relevant tenders and partners based on your goals and capabilities.">
                  <BsExclamationCircle size={20} className='!text-gray-400' />
                </Tooltip>
              </HStack>
            </Box>
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
                    Select certifications your organization holds that are commonly requested in public tenders. You can add new certifications and update their status, but existing certifications cannot be removed.
                  </Text>
                  
                  {/* Inline status selectors for selected certifications */}
                  {companyCertifications && companyCertifications.length > 0 && (
                    <Box  mt="4" p="3" bg="#f9fafb" borderRadius="md" borderWidth="1px" borderColor="#e5e7eb">
                      <VStack gap="4"  align="stretch">
                        <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">
                          Certification detail
                        </Text>
                        {companyCertifications?.map((cert) => {
                          const certInfo = certifications.find(c => c.id === cert.certification_id)
                          const isEquivalent = certInfo?.is_equivalent || false
                          
                          return (
                            <Box key={cert.certification_id} p="3" bg="white" borderRadius="md" borderWidth="1px" borderColor="#e5e7eb">
                              <HStack gap="3" align="flex-start" flexDirection={{ base: "column", md: "row" }}>
                                <Box flex="1" w={{ base: "full", md: "auto" }}>
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
                                <Box minW={{ base: "full", md: "120px" }} w={{ base: "full", md: "auto" }}>
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
                <Box>
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
                  <Text fontSize="xs" color="#666" mt="1">
                    This helps us tailor matches, recommendations, and your dashboard
                  </Text>
                </Box>
                <SelectField
                  label="Which tenders do you usually target?"
                  items={targetTendersOptions}
                  placeholder="Select target tenders"
                  value={formData.target_tenders ? [formData.target_tenders] : []}
                  onValueChange={handleSelectChange('target_tenders')}
                />
              </VStack>
            </Box>

            {/* Eligibility Self-Check Card */}
            <Box
              borderRadius="xl"
              p="5"
              bg="#fafafa"
              borderWidth="1px"
              borderStyle="solid"
              borderColor="#efefef"
            >
              <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">
                Eligibility self-check (self-declared)
              </Text>
              <VStack gap="4" align="stretch">
                <Toggle
                  label="Do you confirm that no mandatory exclusion grounds apply to your organization?"
                  checked={formData.mandatory_exclusion}
                  onCheckedChange={(details) => updateFormData('mandatory_exclusion', details.checked)}
                  helperText="This is a self-declaration. Formal verification occurs during tender submission."
                />
                <Toggle
                  label="Do you confirm that no discretionary exclusion grounds apply that would prevent participation in tenders?"
                  checked={formData.discretionary_exclusion}
                  onCheckedChange={(details) => updateFormData('discretionary_exclusion', details.checked)}
                  helperText="This is a self-declaration. Formal verification occurs during tender submission."
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
              <Box>
                <Toggle
                  label="Open to partner matching"
                  checked={formData.match_ready}
                  onCheckedChange={(details) => updateFormData('match_ready', details.checked)}
                  helperText="Enable this if you want to be matched with other companies for tenders where collaboration is required. You remain in control and can decide whether to share details."
                />
              </Box>
            </Box>
          </VStack>
        </Box>
      ),
    },
    {
      id: 'portfolio',
      value: 'portfolio',
      label: 'Portfolio',
      // leftIcon: <LuBriefcase />,
      content: (
        <Box p={{ base: "3", md: "4" }}>
          <VStack gap="5" align="stretch">
            <Box mb="2" display="flex" justifyContent="space-between" alignItems="flex-start" gap="4">
              <Box flex="1">
                <HStack gap="2" alignItems="center" mb="2">
                  <Heading
                    size={{ base: "lg", sm: "xl" }}
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
                    Portfolio Projects
                    <Text as="span" fontWeight="600" color="#1f6ae1">
                      ({portfolios.filter(p => !p.isDelete).length} of {MAX_PORTFOLIOS})
                    </Text>
                  </Heading>
                  <Tooltip content="Portfolio projects are used to assess whether your organization meets experience and capability requirements commonly requested in public tenders.">
                    <BsExclamationCircle size={20} className='!text-gray-400' />
                  </Tooltip>
                </HStack>
                {/* <Box p="3" borderRadius="lg" bg="#f0f7ff" borderWidth="1px" borderColor="#b3d9ff" mb="4">
                  <Text fontSize="xs" color="#1e3a5f" fontWeight="500" lineHeight="1.5">
                    Portfolio projects are used to assess whether your organization meets experience and capability requirements commonly requested in public tenders.
                  </Text>
                </Box> */}
              </Box>
              <IconButton
                type="button"
                variant="solid"
                onClick={addPortfolio}
                size="sm"
                disabled={portfolios.filter(p => !p.isDelete).length >= MAX_PORTFOLIOS}
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
            <VStack gap="4" align="stretch">
              {portfolios
                .map((portfolio, index) => ({ portfolio, index }))
                .filter(({ portfolio }) => !portfolio.isDelete)
                .map(({ portfolio, index }, displayIndex) => (
                  <Box
                    key={portfolio.id || index}
                    borderRadius="lg"
                    overflow="hidden"
                    transition="all 0.2s"
                    bg={openPortfolioIndex === index ? "#ffffff" : "#fafafa"}
                    borderWidth="2px"
                    borderStyle="solid"
                    borderColor={openPortfolioIndex === index ? "#1f6ae1" : "#e5e7eb"}
                    boxShadow={openPortfolioIndex === index ? "0 4px 16px rgba(31, 106, 225, 0.12)" : "0 1px 3px rgba(0, 0, 0, 0.05)"}
                    _hover={{
                      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                      borderColor: openPortfolioIndex === index ? "#1f6ae1" : "#d1d5db"
                    }}
                  >
                    <Collapsible
                      title={
                        <HStack gap="2" alignItems="center">
                          <Box
                            w="32px"
                            h="32px"
                            borderRadius="md"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            bg={openPortfolioIndex === index ? "rgba(31, 106, 225, 0.1)" : "rgba(107, 114, 128, 0.1)"}
                          >
                            <LuBriefcase style={{ width: "16px", height: "16px", color: openPortfolioIndex === index ? "#1f6ae1" : "#6b7280" }} />
                          </Box>
                          <Text fontSize="md" fontWeight="600" color={openPortfolioIndex === index ? "#1f6ae1" : "#374151"}>
                            {portfolio.title || `Project ${displayIndex + 1}`}
                          </Text>
                          {portfolio.client_type && (
                            <Text fontSize="xs" color="#6b7280" fontWeight="500">
                              • {portfolio.client_type}
                            </Text>
                          )}
                          {portfolio.year && (
                            <Text fontSize="xs" color="#6b7280">
                              • {portfolio.year}
                            </Text>
                          )}
                        </HStack>
                      }
                      open={openPortfolioIndex === index}
                      onOpenChange={() => handlePortfolioToggle(index)}
                      className="border-0"
                    >
                      <Box p="6" pt="4" bg="white">
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb="4" pb="3" borderBottomWidth="1px" borderBottomColor="#e5e7eb">
                          <Text fontSize="sm" fontWeight="600" color="#374151" textTransform="uppercase" letterSpacing="wide">
                            Project Information
                          </Text>
                          {portfolios.filter(p => !p.isDelete).length > 1 && (
                            <IconButton
                              type="button"
                              variant="ghost"
                              size="sm"
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
                        <VStack gap="5" align="stretch">
                          <Box>
                            <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">
                              Basic Information
                            </Text>
                            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
                              <InputField
                                label="Project title"
                                placeholder="Enter project title"
                                value={portfolio.title}
                                onChange={(e) => updatePortfolio(index, 'title', e.target.value)}
                                required
                                invalid={!!portfolioErrors[`portfolio_${index}_title`]}
                                errorText={portfolioErrors[`portfolio_${index}_title`]}
                              />
                              <SelectField
                                label="Client type"
                                items={clientTypes}
                                placeholder="Select client type"
                                value={portfolio.client_type ? [portfolio.client_type] : []}
                                onValueChange={(details) => updatePortfolio(index, 'client_type', details.value[0] || '')}
                                required
                                invalid={!!portfolioErrors[`portfolio_${index}_client_type`]}
                                errorText={portfolioErrors[`portfolio_${index}_client_type`]}
                              />
                            </Box>
                          </Box>
                          <Box>
                            <YearPicker
                              label="Project year"
                              placeholder="Select year"
                              value={portfolio.year || ''}
                              onChange={(e) => {
                                updatePortfolio(index, 'year', e.target.value)
                              }}
                              min={1900}
                              max={new Date().getFullYear() + 10}
                              required
                              invalid={!!portfolioErrors[`portfolio_${index}_year`]}
                              errorText={portfolioErrors[`portfolio_${index}_year`]}
                            />
                          </Box>
                          <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr auto 1fr" }} gap="4" alignItems="start">
                            <SliderField
                              label="Project value range"
                              value={portfolio.value_band != null ? Math.min(CONTRACT_VALUE_MAX, Math.max(CONTRACT_VALUE_MIN, Number(portfolio.value_band))) : 50000}
                              onChange={(value) => updatePortfolio(index, 'value_band', value)}
                              min={CONTRACT_VALUE_MIN}
                              max={CONTRACT_VALUE_MAX}
                              step={50000}
                              maxW="100%"
                              formatValue={formatValueBand}
                            />
                            <Text as="span" alignSelf="center" fontSize="sm" fontWeight="medium" color="gray.600">OR</Text>
                            <InputField
                              label="Or enter value manually (€)"
                              placeholder="e.g. 250000 or 1.5m"
                              value={portfolio.value_band != null ? String(portfolio.value_band) : ''}
                              onChange={(e) => {
                                const v = parseCustomContractRange(e.target.value)
                                updatePortfolio(index, 'value_band', v ?? null)
                              }}
                              invalid={!!portfolioErrors[`portfolio_${index}_value_band`]}
                              errorText={portfolioErrors[`portfolio_${index}_value_band`]}
                            />
                          </Box>
                          <Box>
                            <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">
                              Project Details
                            </Text>
                            <VStack gap="4" align="stretch">
                              <MultiSelectField
                                label="CPV categories"
                                items={cpvs}
                                placeholder="Select CPV categories for this project"
                                value={portfolio.cpvs || []}
                                onValueChange={(details) => updatePortfolio(index, 'cpvs', details.value || [])}
                              />
                              <TextareaField
                                label="Project description"
                                placeholder="Describe the project scope, deliverables, and relevant experience"
                                value={portfolio.description}
                                onChange={(e) => updatePortfolio(index, 'description', e.target.value)}
                                helperText="Focus on aspects that demonstrate your organization's experience and capabilities relevant to public tender requirements"
                                resize="none"
                                autoresize
                                maxH="5lh"
                              />
                            </VStack>
                          </Box>
                        </VStack>
                      </Box>
                    </Collapsible>
                  </Box>
                ))}
            </VStack>
          </VStack>
        </Box>
      ),
    },
    {
      id: 'change-password',
      value: 'change-password',
      label: 'Change Password',
      // leftIcon: <LuLock />,
      content: (
        <Box p={{ base: "3", md: "4" }}>
          <VStack gap="5" align="stretch">
            {/* Section Header */}
            <Box mb="2">
              <Heading
                size={{ base: "lg", sm: "xl" }}
                fontWeight="700"
                style={{
                  background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                Change Password
              </Heading>
              <Text fontSize="sm" color="#666" mt="1">
                Update your account password
              </Text>
            </Box>
            <Box
              borderRadius="xl"
              p="5"
              bg="#fafafa"
              borderWidth="1px"
              borderStyle="solid"
              borderColor="#efefef"
            >
              <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">
                Update Password
              </Text>
              <VStack gap="4" align="stretch">
                <InputField
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <Box>
                  <InputField
                    label="New Password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={passwordForm.password}
                    onChange={handlePasswordChange}
                    required
                  />
                  {passwordForm.password && (() => {
                    const strength = passwordStrength(passwordForm.password)
                    const strengthColors = { "Too weak": "#ff0000", Weak: "#ff8800", Medium: "#ffaa00", Strong: "#4CBB17" }
                    return (
                      <Box mt="3">
                        <HStack gap="2" align="center" mb="2">
                          <Box
                            flex="1"
                            h="4px"
                            borderRadius="full"
                            bg="#efefef"
                            overflow="hidden"
                          >
                            <Box
                              h="100%"
                              borderRadius="full"
                              style={{
                                width: strength.value === "Too weak" ? "25%" : 
                                       strength.value === "Weak" ? "50%" :
                                       strength.value === "Medium" ? "75%" : "100%",
                                background: strengthColors[strength.value] || "#ff0000",
                                transition: "all 0.3s ease"
                              }}
                            />
                          </Box>
                          <Text fontSize="xs" fontWeight="500" color={strengthColors[strength.value]}>
                            {strength.value}
                          </Text>
                        </HStack>
                      </Box>
                    )
                  })()}
                </Box>
                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  invalid={passwordForm.confirmPassword && passwordForm.password !== passwordForm.confirmPassword}
                  errorText="Passwords do not match"
                />
                <Button
                  type="button"
                  onClick={handlePasswordSubmit}
                  loading={isUpdatingPassword}
                  loadingText="Updating..."
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
                  Update Password
                </Button>
              </VStack>
            </Box>
          </VStack>
        </Box>
      ),
    },
  ]

  // Show loading while auth is loading or initial data is being fetched
  if (authLoading || isLoading) {
    return <Loading fullScreen message="Loading profile data..." />
  }

  return (
    <Box
      minH={{ base: "90dvh", lg: "90vh" }}
      maxH="auto"
      position="relative"
      display="flex"
      justifyContent="center"
      p={{ base: "3", md: "4" }}
      overflowX="hidden"
      style={{
        background: "linear-gradient(135deg, #f7f7f7 0%, #efefef 50%, #fafafa 100%)",
      }}
    >
      {/* Decorative background elements - smaller on mobile */}
      <Box
        position="absolute"
        top="5%"
        left="5%"
        w={{ base: "160px", sm: "220px", md: "300px" }}
        h={{ base: "160px", sm: "220px", md: "300px" }}
        borderRadius="full"
        style={{
          background: "linear-gradient(135deg, rgba(31, 106, 225, 0.1) 0%, rgba(107, 78, 255, 0.1) 100%)",
          filter: "blur(80px)",
          zIndex: 0
        }}
      />
      <Box
        position="absolute"
        bottom="5%"
        right="5%"
        w={{ base: "120px", sm: "180px", md: "250px" }}
        h={{ base: "120px", sm: "180px", md: "250px" }}
        borderRadius="full"
        style={{
          background: "linear-gradient(135deg, rgba(107, 78, 255, 0.1) 0%, rgba(31, 106, 225, 0.1) 100%)",
          filter: "blur(80px)",
          zIndex: 0
        }}
      />

      <Box w="full" maxW="900px" mx="auto" position="relative" zIndex={1} minW={0}>
        {/* Header Section */}
        <Box mb={{ base: 4, md: 6 }} textAlign="left">
          <HStack gap={{ base: 2, md: 3 }} mb={{ base: 2, md: 3 }} align="center">
            {/* <Box
              w="48px"
              h="48px"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 4px 12px rgba(31, 106, 225, 0.3)"
              style={{
                background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)"
              }}
            >
              <LuSettings style={{ width: "24px", height: "24px", color: "white" }} />
            </Box> */}
            {/* <Heading
              size="2xl"
              fontWeight="700"
              style={{
                background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Profile Settings
            </Heading> */}
          </HStack>
          <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="500" color="#666">
            Manage your company information and showcase your portfolio
          </Text>
        </Box>

        {/* Profile Card with Tabs - overflow visible so multi-select chips aren't clipped */}
        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)"
          overflow="visible"
          position="relative"
          style={{
            backdropFilter: "blur(10px)",
          }}
        >
          {isSubmitting && <LoadingOverlay message="Saving changes..." />}
          
          {/* Tab Header - scrollable on mobile */}
          <Box
            borderBottomWidth="1px"
            borderBottomStyle="solid"
            borderBottomColor="#efefef"
            px={{ base: "3", sm: "4", md: "6", lg: "8" }}
            pt={{ base: "3", md: "4" }}
            pb="0"
            bg="white"
          >
            <TabButton
              tabs={tabs}
              value={activeTab}
              onValueChange={(details) => setActiveTab(details.value)}
              variant="line"
              colorScheme="primary"
              size="md"
            />
          </Box>

          {/* Save Button Section */}
          <Box
            borderTopWidth="1px"
            borderTopStyle="solid"
            borderTopColor="#efefef"
            px={{ base: "3", sm: "4", md: "6", lg: "8" }}
            py={{ base: "3", md: "4" }}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap="3"
            bg="#fafafa"
          >
            <Box display="flex" alignItems="center" gap="2" flexShrink={0}>
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
                Click save to update your profile
              </Text>
            </Box>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="md"
              w={{ base: "full", sm: "auto" }}
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
              <LuSave style={{ width: "16px", height: "16px", marginRight: "8px" }} />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
