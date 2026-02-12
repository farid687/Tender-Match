'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/hooks/useCompany'
import { toaster } from '@/elements/toaster'
import { Button } from '@/elements/button'
import { InputField } from '@/elements/input'
import { SelectField } from '@/elements/select'
import { MultiSelectField } from '@/elements/multi-select'
import { SliderField } from '@/elements/slider'
import { Box, Text, Heading, VStack, HStack } from '@chakra-ui/react'
import { LuUserRound, LuSave } from 'react-icons/lu'
import { BsExclamationCircle } from 'react-icons/bs'
import { Tooltip } from '@/elements/tooltip'
import Uploader from '@/elements/uploader'
import ProvinceSelectorDialog from '../../onboarding/components/ProvinceSelectorDialog'
import { contractTypes, parseContractRange, formatValueBand, CONTRACT_VALUE_MIN, CONTRACT_VALUE_MAX, parseCustomContractRange } from '../variables'

export default function CompanyProfileTab({ company, regions, cpvs }) {
  const { getCompany } = useCompany()
  const [formData, setFormData] = useState({
    region: '',
    region_interest: [],
    workerSize: '',
    kvk_number: '',
    company_website: '',
    company_logo: '',
    cpvs: [],
    contract_type: [],
    contract_range: 50000,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [preferredRegions, setPreferredRegions] = useState([])
  const preferredRegionsRef = useRef(preferredRegions)
  preferredRegionsRef.current = preferredRegions

  const openProvinceDialog = () => {
    const regionNames = [...new Set(
      regions
        .filter((r) => formData.region_interest.includes(r.id))
        .map((r) => r.name)
        .filter(Boolean)
    )]
    setPreferredRegions(regionNames)
    setDialogOpen(true)
  }

  const handleProvinceDialogOpenChange = (open) => {
    setDialogOpen(open)
    if (!open) {
      const current = preferredRegionsRef.current || []
      const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/-/g, ' ')
      const ids = regions.filter((r) =>
        current.some((n) => norm(r.name) === norm(n))
      ).map((r) => r.id)
      updateFormData('region_interest', ids)
    }
  }

  useEffect(() => {
    if (company) {
      setFormData(prev => ({
        ...prev,
        region: company.region || '',
        region_interest: Array.isArray(company.region_interest) ? company.region_interest : (company.region_interest ? [company.region_interest] : []),
        workerSize: company.worker_size || '',
        kvk_number: company.kvk_number || '',
        company_website: company.company_website || '',
        company_logo: company.company_logo || '',
        cpvs: Array.isArray(company.cpvs) ? company.cpvs : [],
        contract_type: Array.isArray(company.contract_type) ? company.contract_type : (company.contract_type ? [company.contract_type] : []),
        contract_range: company.contract_range != null ? parseContractRange(company.contract_range) : 50000,
      }))
    }
  }, [company])

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleMultiSelectChange = (field) => (details) => {
    setFormData(prev => ({ ...prev, [field]: details.value || [] }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleSelectChange = (field) => (details) => {
    setFormData(prev => ({ ...prev, [field]: details.value[0] || '' }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.region?.trim()) newErrors.region = 'Company location (province) is required'
    if (formData.kvk_number && !/^\d{8}$/.test(formData.kvk_number.trim())) newErrors.kvk_number = 'KVK number must be exactly 8 digits'
    if (!formData.workerSize?.trim()) newErrors.workerSize = 'Worker size is required'
    if (!formData.cpvs?.length) newErrors.cpvs = 'At least one CPVS category is required'
    if (!formData.contract_type?.length) newErrors.contract_type = 'Contract type is required'
    const cr = typeof formData.contract_range === 'number' ? formData.contract_range : parseCustomContractRange(formData.contract_range)
    if (cr == null || cr < CONTRACT_VALUE_MIN || cr > CONTRACT_VALUE_MAX) {
      newErrors.contract_range = 'Enter a contract value (use the slider or enter a value between €0 and €50m)'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const handleSave = async () => {
    if (!supabase) return
    if (!validate()) {
      toaster.create({ title: 'Validation Error', description: 'Please fix the errors before saving.', type: 'error' })
      return
    }
    const companyId = company?.id
    if (!companyId) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('company')
        .update({
          region: formData.region || null,
          region_interest: Array.isArray(formData.region_interest) && formData.region_interest.length > 0 ? formData.region_interest : null,
          cpvs: Array.isArray(formData.cpvs) && formData.cpvs.length > 0 ? formData.cpvs : null,
          worker_size: formData.workerSize || null,
          contract_type: Array.isArray(formData.contract_type) && formData.contract_type.length > 0 ? formData.contract_type : null,
          contract_range: formData.contract_range != null ? (typeof formData.contract_range === 'number' ? formData.contract_range : parseCustomContractRange(formData.contract_range)) : null,
          company_website: formData.company_website || null,
          company_logo: formData.company_logo || null,
        })
        .eq('id', companyId)

      if (error) throw error
      await getCompany(companyId)
      toaster.create({ title: 'Company profile updated', type: 'success' })
    } catch (err) {
      toaster.create({ title: 'Failed to save', description: err.message, type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box p={{ base: "3", md: "4" }}>
      <VStack gap="5" align="stretch">
        <Box mb="2">
          <HStack gap="2" alignItems="center" mb="2">
            <Heading size={{ base: "lg", sm: "xl" }} fontWeight="700" style={{ background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Company Profile
            </Heading>
            <Tooltip content="This information helps us match you with relevant tenders and assess your eligibility for opportunities.">
              <BsExclamationCircle size={20} className='!text-gray-400' />
            </Tooltip>
          </HStack>
        </Box>

        <Box borderRadius="xl" p="5" bg="#fafafa" borderWidth="1px" borderStyle="solid" borderColor="#efefef">
          <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">Basic Information</Text>
          <Box mb="4">
            <Uploader label="Company logo" entityId={company?.id} folder="company" baseName="logo" value={formData.company_logo} onChange={(url) => updateFormData('company_logo', url)} accept="image/png,application/pdf" />
          </Box>
          <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
            <Box>
              <SelectField label="Company location (province)" items={regions} placeholder="Select your company location (province)" value={formData.region ? [formData.region] : []} onValueChange={handleSelectChange('region')} required invalid={!!errors.region} errorText={errors.region} />
              <Text fontSize="xs" color="#666" mt="1">Where your company is registered</Text>
            </Box>
            <Box position="relative">
              <InputField label="KVK Number" placeholder="8-digit KVK number" value={formData.kvk_number} disabled helperText="KVK number cannot be updated through profile settings" style={{ opacity: 0.6, cursor: "not-allowed" }} invalid={!!errors.kvk_number} errorText={errors.kvk_number} />
            </Box>
          </Box>
          <Box mt="4">
            <Button
              type="button"
              variant="ghost"
              onClick={openProvinceDialog}
              size="md"
              className="float-right !text-primary"
            >
              Help Using the map
            </Button>
            <MultiSelectField label="Preferred regions" items={regions} placeholder="Where would you like to receive tenders?" value={formData.region_interest} onValueChange={handleMultiSelectChange('region_interest')} />
            <Text fontSize="xs" color="#666" mt="1">Where would you like to receive tenders?</Text>
          </Box>
        </Box>

        <ProvinceSelectorDialog
          open={dialogOpen}
          onOpenChange={handleProvinceDialogOpenChange}
          preferredRegions={preferredRegions}
          onChange={setPreferredRegions}
          placement='bottom'
        />

        <Box borderRadius="xl" p="5" bg="#fafafa" borderWidth={errors.workerSize ? "2px" : "1px"} borderStyle="solid" borderColor={errors.workerSize ? "#ef4444" : "#efefef"}>
          <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">Company size</Text>
          <Box display="grid" gridTemplateColumns={{ base: "1fr", sm: "repeat(4, 1fr)" }} gap={{ base: 2, md: 3 }} mt="2">
            {[
              { id: 'small', label: 'Small', range: '1 to 10' },
              { id: 'medium', label: 'Medium', range: '10 to 50' },
              { id: 'large', label: 'Large', range: '50 to 100' },
              { id: 'organization', label: 'Enterprise (100+)', range: '100+' },
            ].map((size) => {
              const isSelected = formData.workerSize === size.id
              return (
                <Box key={size.id} as="button" type="button" onClick={() => updateFormData('workerSize', size.id)} display="flex" flexDirection="column" alignItems="center" justifyContent="center" p="3" w="100%" minW={0} borderRadius="xl" borderWidth="2px" borderStyle="solid" borderColor={isSelected ? '#1f6ae1' : '#efefef'} bg={isSelected ? 'rgba(31, 106, 225, 0.08)' : 'white'} transition="all 0.2s" cursor="pointer" _hover={{ borderColor: '#1f6ae1', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(31, 106, 225, 0.15)' }} _focus={{ outline: 'none', ring: '2px', ringColor: '#1f6ae1', ringOffset: '1px' }}>
                  <Box fontSize="lg" mb="0.5" color={isSelected ? '#1f6ae1' : '#333333'}><LuUserRound /></Box>
                  <Text fontWeight="semibold" fontSize="xs" color={isSelected ? '#1f6ae1' : '#1c1c1c'} mb="0" textAlign="center" whiteSpace="normal" wordBreak="break-word">{size.label}</Text>
                  <Text fontSize="2xs" color={isSelected ? '#1f6ae1' : '#333333'} textAlign="center">{size.range}</Text>
                </Box>
              )
            })}
          </Box>
          {errors.workerSize && <Text fontSize="xs" color="red.500" mt="2">{errors.workerSize}</Text>}
        </Box>

        <Box borderRadius="xl" p="5" bg="#fafafa" borderWidth="1px" borderStyle="solid" borderColor="#efefef">
          <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">Business Details</Text>
          <VStack gap="4" align="stretch">
            <Box>
              <MultiSelectField label="Business categories (CPV)" items={cpvs} placeholder="Search CPVs such as IT services, construction, consultancy" value={formData.cpvs} onValueChange={handleMultiSelectChange('cpvs')} required invalid={!!errors.cpvs} errorText={errors.cpvs} />
              <Text fontSize="xs" color="#666" mt="1">Select the CPV categories you want to receive tenders for</Text>
            </Box>
            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
              <Box>
                <MultiSelectField label="Contract type" items={contractTypes} placeholder="Select contract type" value={formData.contract_type} onValueChange={handleMultiSelectChange('contract_type')} required invalid={!!errors.contract_type} errorText={errors.contract_type} />
                <Text fontSize="xs" color="#666" mt="1">Select the types of public contracts you are interested in</Text>
              </Box>
              <Box>
                <InputField label="Company website (optional)" type="url" placeholder="https://www.example.com (optional)" value={formData.company_website} onChange={(e) => updateFormData('company_website', e.target.value)} />
              </Box>
            </Box>
            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr auto 1fr" }} gap="4" alignItems="start">
              <SliderField label="Typical contract value" value={formData.contract_range != null ? Math.min(CONTRACT_VALUE_MAX, Math.max(CONTRACT_VALUE_MIN, Number(formData.contract_range))) : 50000} onChange={(value) => updateFormData('contract_range', value)} min={CONTRACT_VALUE_MIN} max={CONTRACT_VALUE_MAX} step={50000} required maxW="100%" formatValue={formatValueBand} />
              <Text as="span" alignSelf="center" fontSize="sm" fontWeight="medium" color="gray.600">OR</Text>
              <InputField label="Or enter value manually (€)" placeholder="e.g. 250000 or 1.5m" value={formData.contract_range != null ? String(formData.contract_range) : ''} onChange={(e) => { const v = parseCustomContractRange(e.target.value); updateFormData('contract_range', v ?? null) }} invalid={!!errors.contract_range} errorText={errors.contract_range} />
            </Box>
            <Text fontSize="xs" color="#666" mt="1">This is used to match publicly published tenders (€0 – €50m)</Text>
          </VStack>
        </Box>

        <Box display="flex" justifyContent="flex-end">
          <Button type="button" onClick={handleSave} loading={isSubmitting} loadingText="Saving..." size="md" leftIcon={<LuSave size={18} />} style={{ background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)", color: "white", fontWeight: "600" }} _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(31, 106, 225, 0.4)" }}>
            Save Company Profile
          </Button>
        </Box>
      </VStack>
    </Box>
  )
}
