'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/hooks/useCompany'
import { toaster } from '@/elements/toaster'
import { Button } from '@/elements/button'
import { InputField } from '@/elements/input'
import { SelectField } from '@/elements/select'
import { MultiSelectField } from '@/elements/multi-select'
import { Toggle } from '@/elements/toggle'
import { Box, Text, Heading, VStack, HStack } from '@chakra-ui/react'
import { LuSave } from 'react-icons/lu'
import { BsExclamationCircle } from 'react-icons/bs'
import { Tooltip } from '@/elements/tooltip'
import Uploader from '@/elements/uploader'
import { primaryGoalOptions, targetTendersOptions } from '../variables'

export default function CompanyDetailsTab({ company, companyId, onDraftChange }) {
  const { getCompany } = useCompany()
  const [formData, setFormData] = useState({
    primary_goal: [],
    target_tenders: '',
    mandatory_exclusion: false,
    discretionary_exclusion: false,
    match_ready: false,
  })
  const [certifications, setCertifications] = useState([])
  const [companyCertifications, setCompanyCertifications] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchCertifications = useCallback(async () => {
    if (!supabase) return
    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('id, code, name, category, description, is_equivalent')
        .order('category', { ascending: true })
        .order('name', { ascending: true })
      if (error) return
      const mapped = (data || []).map(cert => ({
        id: cert.id,
        code: cert.code || '',
        name: cert.name,
        category: cert.category || 'Other',
        description: cert.description || '',
        is_equivalent: cert.is_equivalent || false
      }))
      setCertifications(mapped)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const fetchCompanyCertifications = useCallback(async (id) => {
    if (!supabase || !id) return
    try {
      const { data, error } = await supabase
        .from('company_certifications')
        .select('id, certification_id, status, notes, document')
        .eq('company_id', id)
      if (error) return
      const mapped = (data ?? []).map((c) => ({
        id: c.id,
        certification_id: c.certification_id,
        status: c.status ?? 'certified',
        notes: c.notes ?? '',
        document: c.document ?? '',
        isExisting: true
      }))
      setCompanyCertifications(mapped)
    } catch (err) {
      console.error(err)
    }
  }, [supabase])

  useEffect(() => {
    if (company) {
      setFormData(prev => ({
        ...prev,
        primary_goal: Array.isArray(company.primary_goal) ? company.primary_goal : (company.primary_goal ? [company.primary_goal] : []),
        target_tenders: company.target_tenders || '',
        mandatory_exclusion: company.mandatory_exclusion || false,
        discretionary_exclusion: company.discretionary_exclusion || false,
        match_ready: company.match_ready || false,
      }))
    }
  }, [company])

  useEffect(() => {
    if (onDraftChange) {
      onDraftChange({ primary_goal: Array.isArray(formData.primary_goal) ? formData.primary_goal : [] })
    }
  }, [onDraftChange, formData.primary_goal])

  useEffect(() => {
    if (!supabase) return
    fetchCertifications()
  }, [ supabase,  fetchCertifications])

  useEffect(() => {
    if (!supabase || !companyId) return
    fetchCompanyCertifications(companyId)
  }, [  supabase,  companyId, fetchCompanyCertifications])

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
  }

  const handleCertificationChange = (details) => {
    const selectedCertIds = details.value || []
    setCompanyCertifications(prev => {
      const existingCertIds = prev.filter(c => c.isExisting).map(c => c.certification_id)
      const finalSelectedIds = [...new Set([...selectedCertIds, ...existingCertIds])]
      const newCertIds = finalSelectedIds.filter(id => !prev.map(c => c.certification_id).includes(id))
      const removedCertIds = prev.map(c => c.certification_id).filter(id => !finalSelectedIds.includes(id))
      let updated = prev.filter(c => c.isExisting)
      prev.filter(c => !c.isExisting && !removedCertIds.includes(c.certification_id)).forEach(c => updated.push(c))
      newCertIds.forEach(certId => updated.push({ certification_id: certId, status: 'certified', notes: '', isExisting: false }))
      return updated
    })
  }

  const handleCertificationStatusChange = (certificationId, status) => {
    setCompanyCertifications(prev => prev.map(c => c.certification_id === certificationId ? { ...c, status, isEdit: c.isExisting } : c))
  }

  const handleCertificationNotesChange = (certificationId, notes) => {
    setCompanyCertifications(prev => prev.map(c => c.certification_id === certificationId ? { ...c, notes, isEdit: c.isExisting } : c))
  }

  const handleCertificationDocumentChange = (companyCertIdOrCertificationId, url) => {
    setCompanyCertifications(prev =>
      prev.map(c =>
        (c.id && c.id === companyCertIdOrCertificationId) || (!c.id && c.certification_id === companyCertIdOrCertificationId)
          ? { ...c, document: url, isEdit: c.isExisting }
          : c
      )
    )
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.primary_goal?.length) newErrors.primary_goal = 'Primary goal is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveCompanyCertifications = async (id) => {
    if (!id || !Array.isArray(companyCertifications)) return
    const inserts = []
    const updates = []
    for (const cert of companyCertifications) {
      if (!cert?.certification_id) continue
      const normalized = {
        company_id: id,
        certification_id: cert.certification_id,
        status: cert.status ?? 'certified',
        notes: cert.notes || null,
        document: cert.document || null
      }
      if (!cert.isExisting) {
        inserts.push(normalized)
        continue
      }
      if (cert.id && cert.isEdit) {
        updates.push({ id: cert.id, status: normalized.status, notes: normalized.notes, document: normalized.document })
      }
    }
    if (inserts.length > 0) {
      const { data: insertedRows, error } = await supabase.from('company_certifications').insert(inserts).select('id, certification_id, status, notes, document')
      if (error) throw new Error(`Insert failed: ${error.message}`)
      setCompanyCertifications(prev =>
        prev.map((c) => {
          if (c.id) return c
          const row = (insertedRows ?? []).find((r) => r.certification_id === c.certification_id)
          return row ? { id: row.id, certification_id: row.certification_id, status: row.status ?? 'certified', notes: row.notes ?? '', document: row.document ?? '', isExisting: true } : c
        })
      )
    }
    if (updates.length > 0) {
      const results = await Promise.all(updates.map((u) => supabase.from('company_certifications').update({ status: u.status, notes: u.notes, document: u.document ?? null }).eq('id', u.id)))
      const err = results.find((r) => r.error)
      if (err) throw new Error(`Update failed: ${err.error?.message ?? err.message}`)
    }
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
      await saveCompanyCertifications(companyId)
      const { error } = await supabase
        .from('company')
        .update({
          primary_goal: Array.isArray(formData.primary_goal) && formData.primary_goal.length > 0 ? formData.primary_goal : null,
          target_tenders: formData.target_tenders || null,
          mandatory_exclusion: formData.mandatory_exclusion || false,
          discretionary_exclusion: formData.discretionary_exclusion || false,
          match_ready: formData.match_ready || false,
        })
        .eq('id', companyId)

      if (error) throw error
      await getCompany(companyId)
      toaster.create({ title: 'Company details updated', type: 'success' })
    } catch (err) {
      toaster.create({ title: 'Failed to save', description: err.message, type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box p="2">
      <VStack gap="5" align="stretch">
        <Box >
          <HStack gap="2" alignItems="center" >
            <Heading size={{ base: "lg", sm: "xl" }} fontWeight="700" style={{ background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Company Details
            </Heading>
            <Tooltip content="This information helps us match you with relevant tenders and partners based on your goals and capabilities.">
              <BsExclamationCircle size={20} className='!text-gray-400' />
            </Tooltip>
          </HStack>
        </Box>

        <Box borderRadius="xl" p="5" bg="#fafafa" borderWidth="1px" borderStyle="solid" borderColor="#efefef">
          <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">Certification & Goals</Text>
          <VStack gap="4" align="stretch">
            <Box>
              <MultiSelectField label="Relevant certifications (optional)" items={certifications} placeholder="Select certifications" value={companyCertifications?.map(c => c.certification_id) || []} onValueChange={handleCertificationChange} groupBy={(item) => item.category || 'Other'} />
              <Text fontSize="xs" color="#666" mt="1">Select certifications your organization holds. You can add new certifications and update their status, but existing certifications cannot be removed.</Text>
              {companyCertifications?.length > 0 && (
                <Box mt="4" p="3" bg="#f9fafb" borderRadius="md" borderWidth="1px" borderColor="#e5e7eb">
                  <VStack gap="4" align="stretch">
                    <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">Certification detail</Text>
                    {companyCertifications.map((cert) => {
                      const certInfo = certifications.find(c => c.id === cert.certification_id)
                      const isEquivalent = certInfo?.is_equivalent || false
                      return (
                        <Box key={cert.certification_id} p="3" bg="white" borderRadius="md" borderWidth="1px" borderColor="#e5e7eb">
                          <HStack gap="3" align="flex-start" flexDirection={{ base: "column", md: "row" }}>
                            <Box flex="1" w={{ base: "full", md: "auto" }}>
                              <Text fontSize="sm" fontWeight="600" mb="1">{certInfo?.name || 'Unknown Certification'}{certInfo?.code && <Text as="span" fontSize="xs" color="#666" ml="2" fontWeight="400">({certInfo.code})</Text>}</Text>
                              {certInfo?.description && <Text fontSize="xs" color="#666" mb="2">{certInfo.description}</Text>}
                            </Box>
                            <Box minW={{ base: "full", md: "120px" }} w={{ base: "full", md: "auto" }}>
                              <SelectField items={[{ id: 'certified', name: 'Certified' }, { id: 'in_progress', name: 'In progress' }, { id: 'self_declared', name: 'Self-declared' }]} placeholder="Select status" value={cert.status ? [cert.status] : ['certified']} onValueChange={(details) => handleCertificationStatusChange(cert.certification_id, details.value[0] || 'certified')} />
                            </Box>
                          </HStack>
                          {isEquivalent && (
                            <Box mt="2">
                              <InputField label="Specify equivalent certification" placeholder="e.g., ISO 9001 equivalent" value={cert.notes || ''} onChange={(e) => handleCertificationNotesChange(cert.certification_id, e.target.value)} helperText="Please specify the equivalent certification you hold" />
                            </Box>
                          )}
                          <Box mt="3">
                            <Uploader label="Certification document" entityId={companyId} subFolder="certification" subEntityId={cert.id || `new-${cert.certification_id}`} baseName="document" value={cert.document || ''} onChange={(url) => handleCertificationDocumentChange(cert.id || cert.certification_id, url)} accept="image/png,application/pdf" />
                          </Box>
                        </Box>
                      )
                    })}
                    <Text fontSize="xs" color="#666" mt="2" fontStyle="italic">Certification status is self-declared and used for matching and eligibility indication only.</Text>
                  </VStack>
                </Box>
              )}
            </Box>
            <Box>
              <MultiSelectField label="What's your main goal?" items={primaryGoalOptions} placeholder="Select your goals" value={formData.primary_goal} onValueChange={handleMultiSelectChange('primary_goal')} required invalid={!!errors.primary_goal} errorText={errors.primary_goal} />
              <Text fontSize="xs" color="#666" mt="1">This helps us tailor matches, recommendations, and your dashboard</Text>
            </Box>
            <SelectField label="Which tenders do you usually target?" items={targetTendersOptions} placeholder="Select target tenders" value={formData.target_tenders ? [formData.target_tenders] : []} onValueChange={handleSelectChange('target_tenders')} />
          </VStack>
        </Box>

        <Box borderRadius="xl" p="5" bg="#fafafa" borderWidth="1px" borderStyle="solid" borderColor="#efefef">
          <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">Eligibility self-check (self-declared)</Text>
          <VStack gap="4" align="stretch">
            <Toggle label="Do you confirm that no mandatory exclusion grounds apply to your organization?" checked={formData.mandatory_exclusion} onCheckedChange={(details) => updateFormData('mandatory_exclusion', details.checked)} helperText="This is a self-declaration. Formal verification occurs during tender submission." />
            <Toggle label="Do you confirm that no discretionary exclusion grounds apply that would prevent participation in tenders?" checked={formData.discretionary_exclusion} onCheckedChange={(details) => updateFormData('discretionary_exclusion', details.checked)} helperText="This is a self-declaration. Formal verification occurs during tender submission." />
          </VStack>
        </Box>

        <Box borderRadius="xl" p="5" bg="#fafafa" borderWidth="1px" borderStyle="solid" borderColor="#efefef">
          <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">Status & Readiness</Text>
          <Toggle label="Open to partner matching" checked={formData.match_ready} onCheckedChange={(details) => updateFormData('match_ready', details.checked)} helperText="Enable this if you want to be matched with other companies for tenders where collaboration is required." />
        </Box>

        <Box display="flex" justifyContent="flex-end">
          <Button type="button" onClick={handleSave} loading={isSubmitting} loadingText="Saving..." size="md" leftIcon={<LuSave size={18} />} style={{ background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)", color: "white", fontWeight: "600" }} _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(31, 106, 225, 0.4)" }}>
            Save Company Details
          </Button>
        </Box>
      </VStack>
    </Box>
  )
}
