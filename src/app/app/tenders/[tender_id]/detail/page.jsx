'use client'

import { useTenderDetail } from '../context/TenderDetailContext'
import { Box, Text, VStack, HStack, SimpleGrid } from '@chakra-ui/react'
import {
  LuFileText,
  LuClipboardList,
  LuCalendarClock,
  LuBookOpen,
  LuScale,
  LuBriefcase,
  LuMapPin,
  LuHash,
  LuTag,
  LuGlobe,
  LuCalendar,
  LuCalendarCheck,
  LuCalendarX,
} from 'react-icons/lu'
import {
  formatTenderDate,
  formatTenderDateTime,
  getContractNatureKey,
} from '../../variables'

const NATURE_LABELS = {
  works: 'Works',
  services: 'Services',
  supplies: 'Supplies',
}

function DetailRow({ label, value, icon: Icon }) {
  const display = value != null && String(value).trim() !== '' ? String(value).trim() : '—'
  const isPlaceholder = display === '—'
  return (
    <HStack
      align="flex-start"
      py={3.5}
      gap={4}
      borderBottomWidth="1px"
      borderBottomColor="var(--color-gray)"
      _last={{ borderBottomWidth: 0 }}
      transition="background 0.15s"
      _hover={{ bg: 'var(--color-very-light-gray)' }}
      px={3}
      mx={-3}
      borderRadius="md"
    >
      {Icon && (
        <Box
          flexShrink={0}
          w="9"
          h="9"
          borderRadius="lg"
          bg={isPlaceholder ? 'var(--color-very-light-gray)' : 'rgba(var(--color-primary-rgb), 0.1)'}
          color={isPlaceholder ? 'var(--color-dark-gray)' : 'var(--color-primary)'}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={18} />
        </Box>
      )}
      <Box flex={1} minW={0}>
        <Text fontSize="xs" fontWeight="600" color="var(--color-dark-gray)" mb={1} textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
        <Text
          fontSize="sm"
          color={isPlaceholder ? 'var(--color-dark-gray)' : 'var(--color-black)'}
          lineHeight="1.5"
          fontWeight={isPlaceholder ? 400 : 500}
        >
          {display}
        </Text>
      </Box>
    </HStack>
  )
}

function DetailSection({ title, icon: Icon, children }) {
  return (
    <Box
      bg="var(--color-white)"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="var(--color-gray)"
      overflow="hidden"
      boxShadow="0 1px 3px rgba(0,0,0,0.04)"
    >
      <HStack
        px={5}
        py={4}
        bg="var(--color-very-light-gray)"
        borderBottomWidth="1px"
        borderBottomColor="var(--color-gray)"
        gap={3}
      >
        <Box
          w="10"
          h="10"
          borderRadius="xl"
          bg="linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)"
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="0 2px 8px rgba(var(--color-primary-rgb), 0.25)"
        >
          {Icon && <Icon size={20} />}
        </Box>
        <Text fontSize="lg" fontWeight="800" color="var(--color-black)" letterSpacing="-0.02em">
          {title}
        </Text>
      </HStack>
      <Box px={5} py={4}>
        {children}
      </Box>
    </Box>
  )
}

export default function TenderDetail() {
  const { tender } = useTenderDetail()

  if (!tender) return null

  const description = tender.description ?? ''
  const procedure = tender.procedure_label ?? '—'
  const cpvMain = tender.cpv_main ?? '—'
  const placeOfPerformance =
    tender.nut_label && tender.country_code
      ? `${tender.nut_label} (${tender.country_code})`
      : (tender.nut_label || tender.country_code || '—')
  const referenceNumber = tender.reference_number ?? tender.tender_id ?? '—'
  const pmNumber = tender.pm_s_number ?? '—'
  const europeanOrNational = tender.is_european === true ? 'European' :  'National' || '—'
  

  const startDate = tender.start_date ?? tender.assignment_start ?? null
  const endDate = tender.end_date ?? tender.assignment_end ?? tender.completion_date ?? null
  const closingDate = tender.closing_date ?? null

  const hasRelatedPublications = !!tender.related_publications_url

  return (
    <Box
      bg="var(--color-white)"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="var(--color-gray)"
     
      boxShadow="0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(var(--color-primary-rgb), 0.06)"
      transition="box-shadow 0.2s ease"
      _hover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 2px 8px rgba(var(--color-primary-rgb), 0.1)' }}
    >
     

      <Box px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
        <VStack align="stretch" gap={{ base: 6, md: 8 }}>
          {/* Description */}
          <DetailSection title="Description" icon={LuFileText}>
            <Box
              px={4}
              py={3}
              bg="var(--color-very-light-gray)"
              borderRadius="lg"
              borderLeftWidth="4px"
              borderLeftColor="var(--color-primary)"
            >
              <Text
                fontSize="sm"
                color="var(--color-black)"
                lineHeight="1.7"
                whiteSpace="pre-wrap"
              >
                {description.trim() || '—'}
              </Text>
            </Box>
          </DetailSection>

          {/* Two columns: Details (left) | Planning + Related (right) */}
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            gap={{ base: 6, lg: 8 }}
            alignItems="stretch"
          >
            {/* Details */}
            <DetailSection title="Details" icon={LuClipboardList}>
              <DetailRow label="Legal framework" value={tender.framework_type ??  '-'} icon={LuScale} />
              <DetailRow label="Type of assignment" value={tender.publication_type_code ?? '—'} icon={LuBriefcase} />
              <DetailRow label="Nature of the assignment" value={tender.assignment_aard_label ?? '—'} icon={LuTag} />
              <DetailRow label="Procedure" value={procedure} icon={LuClipboardList} />
              <DetailRow label="Keywords" value={tender.keywords} icon={LuHash} />
              <DetailRow label="Main assignment (CPV code)" value={cpvMain} icon={LuBriefcase} />
              <DetailRow label="Place of performance (NUTS code)" value={placeOfPerformance} icon={LuMapPin} />
              <DetailRow label="TenderNed feature" value={tender.feature ?? '—'} icon={LuHash} />
              <DetailRow label="Reference number" value={referenceNumber} icon={LuHash} />
              <DetailRow label="PM/S number" value={pmNumber} icon={LuHash} />
              <DetailRow label="European or national" value={europeanOrNational} icon={LuGlobe} />
            </DetailSection>

            {/* Planning + Related publications */}
            <VStack align="stretch" gap={6}>
              <DetailSection title="Planning" icon={LuCalendarClock}>
                <DetailRow
                  label="Start of assignment"
                  value={startDate ? formatTenderDate(startDate) : null}
                  icon={LuCalendar}
                />
                <DetailRow
                  label="Completion of assignment"
                  value={endDate ? formatTenderDate(endDate) : null}
                  icon={LuCalendarCheck}
                />
                <DetailRow
                  label="Closing date"
                  value={closingDate ? formatTenderDateTime(closingDate) : null}
                  icon={LuCalendarX}
                />
              </DetailSection>

              {/* Related publications — commented out for now
              <DetailSection title="Related publications" icon={LuBookOpen}>
                <HStack
                  align="center"
                  gap={3}
                  px={4}
                  py={3}
                  bg={hasRelatedPublications ? 'rgba(var(--color-primary-rgb), 0.08)' : 'var(--color-very-light-gray)'}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={hasRelatedPublications ? 'var(--color-primary)' : 'var(--color-gray)'}
                >
                  <Box
                    w="8"
                    h="8"
                    borderRadius="md"
                    bg={hasRelatedPublications ? 'var(--color-primary)' : 'var(--color-dark-gray)'}
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <LuBookOpen size={16} />
                  </Box>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color={hasRelatedPublications ? 'var(--color-primary)' : 'var(--color-dark-gray)'}
                  >
                    {hasRelatedPublications ? 'Yes — publications available' : 'No related publications'}
                  </Text>
                </HStack>
              </DetailSection>
              */}
            </VStack>
          </SimpleGrid>
        </VStack>
      </Box>
    </Box>
  )
}
