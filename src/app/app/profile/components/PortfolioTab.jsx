'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toaster } from '@/elements/toaster'
import { Button } from '@/elements/button'
import { IconButton } from '@/elements/icon-button'
import { InputField } from '@/elements/input'
import { TextareaField } from '@/elements/textarea'
import { SelectField } from '@/elements/select'
import { MultiSelectField } from '@/elements/multi-select'
import { SliderField } from '@/elements/slider'
import { Collapsible } from '@/elements/collapsible'
import { YearPicker } from '@/elements/year-picker'
import { Box, Text, Heading, VStack, HStack } from '@chakra-ui/react'
import { LuBriefcase, LuPlus, LuTrash2, LuSave } from 'react-icons/lu'
import { BsExclamationCircle } from 'react-icons/bs'
import { Tooltip } from '@/elements/tooltip'
import { clientTypes, MAX_PORTFOLIOS, formatValueBand, CONTRACT_VALUE_MIN, CONTRACT_VALUE_MAX, parseContractRange, parseCustomContractRange } from '../variables'

export default function PortfolioTab({ companyId }) {
  const [portfolios, setPortfolios] = useState([{ title: '', client_type: '', year: '', value_band: 50000, description: '', cpvs: [] }])
  const [openPortfolioIndex, setOpenPortfolioIndex] = useState(0)
  const [cpvsList, setCpvsList] = useState([])
  const [portfolioErrors, setPortfolioErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCpvs = useCallback(async () => {
    if (!supabase) return
    try {
      const { data, error } = await supabase.from('cpvs').select('id, cpv_code, main_cpv_description').order('cpv_code', { ascending: true })
      if (error) return setCpvsList([])
      setCpvsList((data || []).map(cpv => ({ id: cpv.id, name: `${cpv.cpv_code} - ${cpv.main_cpv_description || ''}` })))
    } catch {
      setCpvsList([])
    }
  }, [])

  const fetchPortfolioData = useCallback(async (id) => {
    if (!supabase || !id) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from('portfolio').select('*').eq('company_id', id).order('created_at', { ascending: false })
      if (error) throw error
      if (data?.length > 0) {
        const portfoliosWithCpvs = data.map(portfolio => {
          let yearValue = portfolio.year
          if (typeof yearValue === 'number') yearValue = yearValue.toString()
          else if (typeof yearValue === 'string' && yearValue.includes('-')) yearValue = new Date(yearValue).getFullYear().toString()
          return {
            ...portfolio,
            year: yearValue || '',
            cpvs: Array.isArray(portfolio.cpvs) ? portfolio.cpvs : (portfolio.cpvs ? [portfolio.cpvs] : []),
            value_band: typeof portfolio.value_band === 'number' ? portfolio.value_band : parseContractRange(portfolio.value_band)
          }
        })
        setPortfolios(portfoliosWithCpvs)
        setOpenPortfolioIndex(0)
      } else {
        setPortfolios([{ title: '', client_type: '', year: '', value_band: 50000, description: '', cpvs: [] }])
      }
    } catch (err) {
      console.error(err)
      toaster.create({ title: 'Failed to load portfolio', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return
    fetchCpvs()
  }, [fetchCpvs])

  useEffect(() => {
    if (!supabase || !companyId) return
    fetchPortfolioData(companyId)
  }, [companyId, fetchPortfolioData])

  const addPortfolio = () => {
    if (portfolios.filter(p => !p.isDelete).length >= MAX_PORTFOLIOS) return
    const newIndex = portfolios.length
    setPortfolios(prev => [...prev, { title: '', client_type: '', year: '', value_band: 50000, description: '', cpvs: [], isNew: true }])
    setOpenPortfolioIndex(newIndex)
  }

  const removePortfolio = (index) => {
    const portfolio = portfolios[index]
    if (portfolio.isNew) {
      const newPortfolios = portfolios.filter((_, i) => i !== index)
      setPortfolios(newPortfolios)
      setOpenPortfolioIndex(openPortfolioIndex === index ? (newPortfolios.length ? 0 : null) : openPortfolioIndex > index ? openPortfolioIndex - 1 : openPortfolioIndex)
    } else {
      setPortfolios(prev => prev.map((p, i) => (i === index ? { ...p, isDelete: true } : p)))
    }
  }

  const handlePortfolioToggle = (index) => {
    setOpenPortfolioIndex(openPortfolioIndex === index ? null : index)
  }

  const updatePortfolio = (index, field, value) => {
    setPortfolios(prev =>
      prev.map((p, i) =>
        i === index ? { ...p, [field]: value, isEdit: (p.id && !p.isNew) || p.isEdit } : p
      )
    )
    const errorKey = `portfolio_${index}_${field}`
    if (portfolioErrors[errorKey]) setPortfolioErrors(prev => { const next = { ...prev }; delete next[errorKey]; return next })
  }

  const deletePortfolios = async (ids) => {
    if (!ids?.length) return
    const { error } = await supabase.from('portfolio').delete().in('id', ids)
    if (error) throw new Error(`Failed to delete portfolios: ${error.message}`)
  }

  const updatePortfolios = async (toUpdate) => {
    if (!toUpdate?.length) return
    const results = await Promise.all(
      toUpdate.map(({ portfolio, id }) => {
        const { isNew, isEdit, isDelete, ...d } = portfolio
        return supabase.from('portfolio').update({
          title: d.title,
          client_type: d.client_type || null,
          year: d.year || null,
          value_band: d.value_band ?? null,
          description: d.description || null,
          cpvs: Array.isArray(d.cpvs) && d.cpvs.length > 0 ? d.cpvs : null,
        }).eq('id', id)
      })
    )
    const err = results.find(r => r.error)
    if (err) throw new Error(`Failed to update portfolios: ${err.error?.message}`)
  }

  const createPortfolios = async (id, toCreate) => {
    if (!toCreate?.length) return
    const payload = toCreate.map(({ isNew, isEdit, isDelete, ...d }) => ({
      title: d.title,
      client_type: d.client_type || null,
      year: d.year || null,
      value_band: d.value_band ?? null,
      description: d.description || null,
      cpvs: Array.isArray(d.cpvs) && d.cpvs.length > 0 ? d.cpvs : null,
      company_id: id,
    }))
    const { error } = await supabase.from('portfolio').insert(payload)
    if (error) throw new Error(`Failed to create portfolios: ${error.message}`)
  }

  const validate = () => {
    const newErrors = {}
    portfolios.filter(p => !p.isDelete).forEach((portfolio, index) => {
      if (!portfolio.title?.trim()) newErrors[`portfolio_${index}_title`] = 'Portfolio title is required'
      if (!portfolio.client_type?.trim()) newErrors[`portfolio_${index}_client_type`] = 'Client type is required'
      const yearValue = portfolio.year?.toString().trim() || ''
      if (!yearValue) newErrors[`portfolio_${index}_year`] = 'Year is required'
      else {
        const year = parseInt(yearValue, 10)
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 10) newErrors[`portfolio_${index}_year`] = 'Invalid year'
      }
      const vb = typeof portfolio.value_band === 'number' ? portfolio.value_band : parseCustomContractRange(portfolio.value_band)
      if (vb == null || vb < CONTRACT_VALUE_MIN || vb > CONTRACT_VALUE_MAX) newErrors[`portfolio_${index}_value_band`] = 'Enter a project value between €0 and €50m'
    })
    setPortfolioErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!supabase) return
    if (!validate()) {
      toaster.create({ title: 'Validation Error', description: 'Please fix the errors before saving.', type: 'error' })
      return
    }
    if (!companyId) return

    setIsSubmitting(true)
    try {
      const toDelete = portfolios.filter(p => p.isDelete && p.id).map(p => p.id)
      if (toDelete.length) await deletePortfolios(toDelete)

      const toProcess = portfolios.filter(p => !p.isDelete && p.title?.trim())
      const toUpdate = toProcess.filter(p => p.isEdit && p.id && !p.isNew).map(p => ({ portfolio: p, id: p.id }))
      const toCreate = toProcess.filter(p => p.isNew && !p.id)

      await updatePortfolios(toUpdate)
      await createPortfolios(companyId, toCreate)

      await fetchPortfolioData(companyId)
      toaster.create({ title: 'Portfolio updated', type: 'success' })
    } catch (err) {
      toaster.create({ title: 'Failed to save portfolio', description: err.message, type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const items = cpvsList

  if (isLoading) {
    return (
      <Box p={4}>
        <Text color="var(--color-dark-gray)">Loading portfolio...</Text>
      </Box>
    )
  }

  return (
    <Box p="2">
      <VStack gap="5" align="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap="4">
          <Box flex="1">
            <HStack gap="2" alignItems="center" >
              <Heading size={{ base: "lg", sm: "xl" }} fontWeight="700" style={{ background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Portfolio Projects
                <Text as="span" fontWeight="600" color="#1f6ae1" ml="2">({portfolios.filter(p => !p.isDelete).length} of {MAX_PORTFOLIOS})</Text>
              </Heading>
              <Tooltip content="Portfolio projects are used to assess whether your organization meets experience and capability requirements commonly requested in public tenders.">
                <BsExclamationCircle size={20} className='!text-gray-400' />
              </Tooltip>
            </HStack>
          </Box>
          <IconButton type="button" variant="solid" onClick={addPortfolio} size="sm" disabled={portfolios.filter(p => !p.isDelete).length >= MAX_PORTFOLIOS} style={{ background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)", color: "white" }} _hover={{ transform: "translateY(-2px)" }} aria-label="Add portfolio">
            <LuPlus />
          </IconButton>
        </Box>

        <VStack gap="4" align="stretch">
          {portfolios.filter(p => !p.isDelete).map((portfolio, displayIndex) => {
            const index = portfolios.findIndex(p => p === portfolio)
            return (
              <Box key={portfolio.id || index} borderRadius="lg" overflow="hidden" bg={openPortfolioIndex === index ? "#ffffff" : "#fafafa"} borderWidth="2px" borderStyle="solid" borderColor={openPortfolioIndex === index ? "#1f6ae1" : "#e5e7eb"}>
                <Collapsible
                  title={
                    <HStack gap="2" alignItems="center">
                      <Box w="32px" h="32px" borderRadius="md" display="flex" alignItems="center" justifyContent="center" bg={openPortfolioIndex === index ? "rgba(31, 106, 225, 0.1)" : "rgba(107, 114, 128, 0.1)"}>
                        <LuBriefcase style={{ width: "16px", height: "16px", color: openPortfolioIndex === index ? "#1f6ae1" : "#6b7280" }} />
                      </Box>
                      <Text fontSize="md" fontWeight="600" color={openPortfolioIndex === index ? "#1f6ae1" : "#374151"}>{portfolio.title || `Project ${displayIndex + 1}`}</Text>
                      {portfolio.client_type && <Text fontSize="xs" color="#6b7280">• {portfolio.client_type}</Text>}
                      {portfolio.year && <Text fontSize="xs" color="#6b7280">• {portfolio.year}</Text>}
                    </HStack>
                  }
                  open={openPortfolioIndex === index}
                  onOpenChange={() => handlePortfolioToggle(index)}
                >
                  <Box p="6" pt="4" bg="white">
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb="4" pb="3" borderBottomWidth="1px" borderBottomColor="#e5e7eb">
                      <Text fontSize="sm" fontWeight="600" color="#374151" textTransform="uppercase" letterSpacing="wide">Project Information</Text>
                      {portfolios.filter(p => !p.isDelete).length > 1 && (
                        <IconButton type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); removePortfolio(index) }} aria-label="Remove portfolio" colorScheme="red"><LuTrash2 /></IconButton>
                      )}
                    </Box>
                    <VStack gap="5" align="stretch">
                      <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
                        <InputField label="Project title" placeholder="Enter project title" value={portfolio.title} onChange={(e) => updatePortfolio(index, 'title', e.target.value)} required invalid={!!portfolioErrors[`portfolio_${index}_title`]} errorText={portfolioErrors[`portfolio_${index}_title`]} />
                        <SelectField label="Client type" items={clientTypes} placeholder="Select client type" value={portfolio.client_type ? [portfolio.client_type] : []} onValueChange={(details) => updatePortfolio(index, 'client_type', details.value[0] || '')} required invalid={!!portfolioErrors[`portfolio_${index}_client_type`]} errorText={portfolioErrors[`portfolio_${index}_client_type`]} />
                      </Box>
                      <YearPicker label="Project year" placeholder="Select year" value={portfolio.year || ''} onChange={(e) => updatePortfolio(index, 'year', e.target.value)} min={1900} max={new Date().getFullYear() + 10} required invalid={!!portfolioErrors[`portfolio_${index}_year`]} errorText={portfolioErrors[`portfolio_${index}_year`]} />
                      <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr auto 1fr" }} gap="4" alignItems="start">
                        <SliderField label="Project value range" value={portfolio.value_band != null ? Math.min(CONTRACT_VALUE_MAX, Math.max(CONTRACT_VALUE_MIN, Number(portfolio.value_band))) : 50000} onChange={(value) => updatePortfolio(index, 'value_band', value)} min={CONTRACT_VALUE_MIN} max={CONTRACT_VALUE_MAX} step={50000} maxW="100%" formatValue={formatValueBand} />
                        <Text as="span" alignSelf="center" fontSize="sm" fontWeight="medium" color="gray.600">OR</Text>
                        <InputField label="Or enter value manually (€)" placeholder="e.g. 250000 or 1.5m" value={portfolio.value_band != null ? String(portfolio.value_band) : ''} onChange={(e) => { const v = parseCustomContractRange(e.target.value); updatePortfolio(index, 'value_band', v ?? null) }} invalid={!!portfolioErrors[`portfolio_${index}_value_band`]} errorText={portfolioErrors[`portfolio_${index}_value_band`]} />
                      </Box>
                      <Box>
                        <MultiSelectField label="CPV categories" items={items} placeholder="Select CPV categories for this project" value={portfolio.cpvs || []} onValueChange={(details) => updatePortfolio(index, 'cpvs', details.value || [])} />
                        <TextareaField label="Project description" placeholder="Describe the project scope, deliverables, and relevant experience" value={portfolio.description} onChange={(e) => updatePortfolio(index, 'description', e.target.value)} helperText="Focus on aspects that demonstrate your organization's experience and capabilities" resize="none" autoresize maxH="5lh" />
                      </Box>
                    </VStack>
                  </Box>
                </Collapsible>
              </Box>
            )
          })}
        </VStack>

        <Box display="flex" justifyContent="flex-end">
          <Button type="button" onClick={handleSave} loading={isSubmitting} loadingText="Saving..." size="md" leftIcon={<LuSave size={18} />} style={{ background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)", color: "white", fontWeight: "600" }} _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(31, 106, 225, 0.4)" }}>
            Save Portfolio
          </Button>
        </Box>
      </VStack>
    </Box>
  )
}
