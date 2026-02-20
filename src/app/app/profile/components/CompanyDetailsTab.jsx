'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useGlobal } from '@/context'
import { useCompany } from '@/hooks/useCompany'
import { toaster } from '@/elements/toaster'

import { Button } from '@/elements/button'
import { InputField } from '@/elements/input'
import { SelectField } from '@/elements/select'
import { MultiSelectField } from '@/elements/multi-select'
import { Toggle } from '@/elements/toggle'
import { Tooltip } from '@/elements/tooltip'
import Uploader from '@/elements/uploader'

import { Box, Text, Heading, VStack, HStack } from '@chakra-ui/react'
import { LuSave } from 'react-icons/lu'
import { BsExclamationCircle } from 'react-icons/bs'

import { primaryGoalOptions, targetTendersOptions } from '../variables'

/* -------------------------------------------------------------------------- */
/*                               Helper functions                             */
/* -------------------------------------------------------------------------- */

const normalizeCompanyForm = (company = {}) => ({
  primary_goal: Array.isArray(company.primary_goal)
    ? company.primary_goal
    : company.primary_goal
    ? [company.primary_goal]
    : [],
  target_tenders: company.target_tenders || '',
  mandatory_exclusion: !!company.mandatory_exclusion,
  discretionary_exclusion: !!company.discretionary_exclusion,
  match_ready: !!company.match_ready,
})

const buildCertificationPayload = (companyId, cert) => ({
  company_id: companyId,
  certification_id: cert.certification_id,
  status: cert.status ?? 'certified',
  notes: cert.notes || null,
  document: cert.document || null,
})

/* -------------------------------------------------------------------------- */

export default function CompanyDetailsTab({ company, companyId, onDraftChange }) {
  const { certifications, companyCertifications, setCompanyCertifications } = useGlobal()
  const { getCompany } = useCompany()

  const [formData, setFormData] = useState(normalizeCompanyForm())
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* -------------------------------------------------------------------------- */
  /*                                 Effects                                    */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (company) setFormData(normalizeCompanyForm(company))
  }, [company])

  useEffect(() => {
    onDraftChange?.({ primary_goal: formData.primary_goal || [] })
  }, [formData.primary_goal, onDraftChange])

  /* -------------------------------------------------------------------------- */
  /*                               State helpers                                */
  /* -------------------------------------------------------------------------- */

  const updateForm = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: undefined }))
  }

  const updateCertification = (certificationId, patch) => {
    setCompanyCertifications((prev) =>
      prev.map((c) =>
        c.certification_id === certificationId
          ? { ...c, ...patch, isEdit: c.isExisting }
          : c
      )
    )
  }

  /* -------------------------------------------------------------------------- */
  /*                    Certification selection + merging                       */
  /* -------------------------------------------------------------------------- */

  const handleCertificationChange = ({ value = [] }) => {
    setCompanyCertifications((prev) => {
      const existingIds = prev.filter((c) => c.isExisting).map((c) => c.certification_id)
      const selected = [...new Set([...value, ...existingIds])]

      const map = new Map(prev.map((c) => [c.certification_id, c]))

      return selected.map((id) => {
        return (
          map.get(id) || {
            certification_id: id,
            status: 'certified',
            notes: '',
            document: '',
            isExisting: false,
          }
        )
      })
    })
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Validation                                 */
  /* -------------------------------------------------------------------------- */

  const validate = () => {
    const err = {}
    if (!formData.primary_goal?.length) err.primary_goal = 'Primary goal is required'
    setErrors(err)
    return !Object.keys(err).length
  }

  /* -------------------------------------------------------------------------- */
  /*                       Certification persistence                            */
  /* -------------------------------------------------------------------------- */

  const saveCompanyCertifications = useCallback(async () => {
    if (!companyId) return

    const inserts = []
    const updates = []

    for (const cert of companyCertifications) {
      if (!cert?.certification_id) continue

      const payload = buildCertificationPayload(companyId, cert)

      if (!cert.isExisting) inserts.push(payload)
      else if (cert.id && cert.isEdit) updates.push({ id: cert.id, ...payload })
    }

    /* insert */
    if (inserts.length) {
      const { data, error } = await supabase
        .from('company_certifications')
        .insert(inserts)
        .select('id, certification_id, status, notes, document')

      if (error) throw error

      setCompanyCertifications((prev) =>
        prev.map((c) => {
          if (c.id) return c
          const row = data?.find((r) => r.certification_id === c.certification_id)
          return row ? { ...c, ...row, isExisting: true } : c
        })
      )
    }

    /* update */
    if (updates.length) {
      await Promise.all(
        updates.map(({ id, status, notes, document }) =>
          supabase
            .from('company_certifications')
            .update({ status, notes, document })
            .eq('id', id)
        )
      )
    }
  }, [companyId, companyCertifications, setCompanyCertifications])

  /* -------------------------------------------------------------------------- */
  /*                                  Save                                      */
  /* -------------------------------------------------------------------------- */

  const handleSave = async () => {
    if (!validate()) {
      toaster.create({
        title: 'Validation Error',
        description: 'Please fix the errors before saving.',
        type: 'error',
      })
      return
    }

    setIsSubmitting(true)

    try {
      await saveCompanyCertifications()

      const { error } = await supabase
        .from('company')
        .update({
          primary_goal: formData.primary_goal?.length ? formData.primary_goal : null,
          target_tenders: formData.target_tenders || null,
          mandatory_exclusion: formData.mandatory_exclusion,
          discretionary_exclusion: formData.discretionary_exclusion,
          match_ready: formData.match_ready,
        })
        .eq('id', companyId)

      if (error) throw error

      await getCompany()

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

        <Box>
          <HStack gap="2" alignItems="center">
            <Heading
              size={{ base: 'lg', sm: 'xl' }}
              fontWeight="700"
              style={{
                background: 'linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Company Details
            </Heading>
            <Tooltip content="This information helps us match you with relevant tenders and partners based on your goals and capabilities.">
              <BsExclamationCircle size={20} className="!text-gray-400" />
            </Tooltip>
          </HStack>
        </Box>

        <Box borderRadius="xl" p="5" bg="#fafafa" borderWidth="1px" borderStyle="solid" borderColor="#efefef">
          <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">
            Certification & Goals
          </Text>

          <VStack gap="4" align="stretch">
            <Box>
              <MultiSelectField
                label="Relevant certifications (optional)"
                items={certifications}
                placeholder="Select certifications"
                value={companyCertifications?.map((c) => c.certification_id) || []}
                onValueChange={handleCertificationChange}
                groupBy={(item) => item.category || 'Other'}
              />
              <Text fontSize="xs" color="#666" mt="1">
                Select certifications your organization holds. You can add new certifications and update their status, but existing certifications cannot be removed.
              </Text>
            </Box>

            {companyCertifications.length > 0 && (
              <Box mt="4" p="3" bg="#f9fafb" borderRadius="md" borderWidth="1px" borderColor="#e5e7eb">
                <VStack gap="4" align="stretch">
                  <Text fontSize="xs" fontWeight="600" mb="2" textTransform="uppercase" letterSpacing="wide" color="#333">
                    Certification detail
                  </Text>
                  {companyCertifications.map((cert) => {
                    const certInfo = certifications.find((c) => c.id === cert.certification_id)
                    const name = cert.name ?? certInfo?.name ?? 'Unknown Certification'
                    const description = cert.description ?? certInfo?.description
                    const isEquivalent = certInfo?.is_equivalent ?? cert.is_equivalent ?? false
                    const code = certInfo?.code ?? cert.code
                    return (
                      <Box key={cert.certification_id} p="3" bg="white" borderRadius="md" borderWidth="1px" borderColor="#e5e7eb">
                        <HStack gap="3" align="flex-start" flexDirection={{ base: 'column', md: 'row' }}>
                          <Box flex="1" w={{ base: 'full', md: 'auto' }}>
                            <Text fontSize="sm" fontWeight="600" mb="1">
                              {name}
                              {code && (
                                <Text as="span" fontSize="xs" color="#666" ml="2" fontWeight="400">
                                  ({code})
                                </Text>
                              )}
                            </Text>
                            {description && (
                              <Text fontSize="xs" color="#666" mb="2">
                                {description}
                              </Text>
                            )}
                          </Box>
                          <Box minW={{ base: 'full', md: '120px' }} w={{ base: 'full', md: 'auto' }} display="flex"  flexDirection="row" gap="3" alignItems="center">
                            <SelectField
                              items={[
                                { id: 'certified', name: 'Certified' },
                                { id: 'in_progress', name: 'In progress' },
                                { id: 'self_declared', name: 'Self-declared' },
                              ]}
                              placeholder="Select status"
                              value={cert.status ? [cert.status] : ['certified']}
                              onValueChange={(d) =>
                                updateCertification(cert.certification_id, {
                                  status: d.value[0] || 'certified',
                                })
                              }
                            />
                             <Box >
                          <Uploader
                            
                            entityId={companyId}
                            subFolder="certification"
                            subEntityId={cert.id || `new-${cert.certification_id}`}
                            baseName="document"
                            value={cert.document || ''}
                            onChange={(url) =>
                              updateCertification(cert.certification_id, {
                                document: url,
                              })
                            }
                            accept="image/png,application/pdf"
                          />
                        </Box>
                          </Box>
                        </HStack>
                        {isEquivalent && (
                          <Box mt="2">
                            <InputField
                              label="Specify equivalent certification"
                              placeholder="e.g., ISO 9001 equivalent"
                              value={cert.notes || ''}
                              onChange={(e) =>
                                updateCertification(cert.certification_id, {
                                  notes: e.target.value,
                                })
                              }
                              helperText="Please specify the equivalent certification you hold"
                            />
                          </Box>
                        )}
                       
                      </Box>
                    )
                  })}
                  <Text fontSize="xs" color="#666" mt="2" fontStyle="italic">
                    Certification status is self-declared and used for matching and eligibility indication only.
                  </Text>
                </VStack>
              </Box>
            )}

            <Box>
              <MultiSelectField
                label="What's your main goal?"
                items={primaryGoalOptions}
                placeholder="Select your goals"
                value={formData.primary_goal}
                onValueChange={(d) => updateForm('primary_goal', d.value)}
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
              onValueChange={(d) => updateForm('target_tenders', d.value?.[0] || '')}
            />
          </VStack>
        </Box>

        <Box borderRadius="xl" p="5" bg="#fafafa" borderWidth="1px" borderStyle="solid" borderColor="#efefef">
          <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">
            Eligibility self-check (self-declared)
          </Text>
          <VStack gap="4" align="stretch">
            <Toggle
              label="Do you confirm that no mandatory exclusion grounds apply to your organization?"
              checked={formData.mandatory_exclusion}
              onCheckedChange={(d) => updateForm('mandatory_exclusion', d.checked)}
              helperText="This is a self-declaration. Formal verification occurs during tender submission."
            />
            <Toggle
              label="Do you confirm that no discretionary exclusion grounds apply that would prevent participation in tenders?"
              checked={formData.discretionary_exclusion}
              onCheckedChange={(d) => updateForm('discretionary_exclusion', d.checked)}
              helperText="This is a self-declaration. Formal verification occurs during tender submission."
            />
          </VStack>
        </Box>

        <Box borderRadius="xl" p="5" bg="#fafafa" borderWidth="1px" borderStyle="solid" borderColor="#efefef">
          <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">
            Status & Readiness
          </Text>
          <Toggle
            label="Open to partner matching"
            checked={formData.match_ready}
            onCheckedChange={(d) => updateForm('match_ready', d.checked)}
            helperText="Enable this if you want to be matched with other companies for tenders where collaboration is required."
          />
        </Box>

        <Box display="flex" justifyContent="flex-end">
          <Button
            type="button"
            onClick={handleSave}
            loading={isSubmitting}
            loadingText="Saving..."
            size="md"
            leftIcon={<LuSave size={18} />}
            style={{
              background: 'linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)',
              color: 'white',
              fontWeight: '600',
            }}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(31, 106, 225, 0.4)',
            }}
          >
            Save Company Details
          </Button>
        </Box>

      </VStack>
    </Box>
  )
}
