'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react'
import { LuMapPin, LuFileText, LuUserRound } from 'react-icons/lu'
import { formatTenderCurrency, formatTenderDate, getClosesInText } from '../variables'

function TenderCard({ t, cpvMainDisplay }) {
  const closesIn = getClosesInText(t?.closing_date ?? '')
  const daysMatch = closesIn && closesIn.match(/(\d+)\s*day/)
  const daysLeft = daysMatch ? parseInt(daysMatch[1], 10) : (closesIn === 'Closes today' ? 0 : null)
  const isUrgent = daysLeft !== null && daysLeft <= 7
  const isOpen = closesIn && closesIn !== 'Closed'
  const cpvDisplay = cpvMainDisplay(t)

  const detailHref = t?.tender_id ? `/app/tenders/${t.tender_id}` : null

  return (
    <Box
      as={detailHref ? Link : 'article'}
      href={detailHref}
      cursor={detailHref ? 'pointer' : undefined}
      bg="var(--color-white)"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="var(--color-gray)"
      overflow="hidden"
      boxShadow="0 1px 3px rgba(var(--color-primary-rgb), 0.06)"
      transition="box-shadow 0.2s, border-color 0.2s"
      _hover={{ textDecoration: 'none', boxShadow: 'var(--shadow-card-hover)', borderColor: 'var(--color-primary)' }}
    >
      <HStack align="stretch" gap={4} p={4} flexWrap={{ base: 'wrap', lg: 'nowrap' }}>
        <HStack align="flex-start" gap={3} flex="0 0 auto">
          <Box
            w="12"
            h="12"
            borderRadius="md"
            bg="var(--color-black)"
            color="var(--color-white)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <LuFileText size={24} />
          </Box>
          <VStack align="flex-start" gap={0.5}>
            <HStack gap={4} flexWrap="wrap" alignItems="baseline">
              <Box>
                <Text fontSize="xs" color="var(--color-primary)" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Published</Text>
                <Text fontWeight="700" fontSize="md" color="var(--color-black)" lineHeight="1.3">{formatTenderDate(t.publication_datetime)}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="var(--color-primary)" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Deadline</Text>
                <Text fontWeight="700" fontSize="md" color="var(--color-black)" lineHeight="1.3">{formatTenderDate(t.closing_date)}</Text>
              </Box>
            </HStack>
            {t.nut_label && (
              <HStack gap={1} mt={2} color="var(--color-dark-gray)">
                <LuMapPin size={14} style={{ flexShrink: 0 }} />
                <Text fontSize="xs">{t.nut_label}</Text>
              </HStack>
            )}
          </VStack>
        </HStack>
        <VStack align={{ base: 'flex-start', lg: 'flex-end' }} justify="center" gap={2} flex="1" minW={0}>
          <VStack align={{ base: 'flex-start', lg: 'flex-end' }} gap={2}>
            <Box textAlign={{ base: 'left', lg: 'right' }}>
              <Text fontSize="xs" color="var(--color-dark-gray)" fontWeight="500">Estimated value</Text>
              <Text fontWeight="700" fontSize={{ base: 'xl', md: '2xl' }} color="var(--color-primary)" lineHeight="1.2">
                {formatTenderCurrency(t.estimated_value_amount)}
              </Text>
            </Box>
            <VStack align={{ base: 'flex-start', lg: 'flex-end' }} gap={0.5}>
              <Text fontSize="xs" color="var(--color-dark-gray)" fontWeight="500">Time Remaining</Text>
              <Badge
                size="sm"
                borderRadius="full"
              px={2}
              py={1}
              fontWeight="600"
              fontSize="sm"
              textTransform="none"
              style={{
                background: isOpen
                  ? (isUrgent ? '#dc2626' : 'var(--color-success)')
                  : 'var(--color-dark-gray)',
                color: 'var(--color-white)',
                border: 'none',
              }}
            >
              {isOpen ? closesIn : (t.tender_status || '—')}
              </Badge>
            </VStack>
          </VStack>
        </VStack>
      </HStack>
      <Box px={4} pb={2}>
        <Text truncate fontWeight="700" fontSize="md" color="var(--color-black)" lineHeight="1.3" noOfLines={2}>
          {t.title || '—'}
        </Text>
        {t.description && (
          <Text truncate fontSize="sm" color="var(--color-dark-gray)" mt={0.5} noOfLines={1}>
            {t.description}
          </Text>
        )}
        {t.client_name && (
          <HStack align="center" justify="flex-start" gap={2} mt={2}>
            <Box
              w="8"
              h="8"
              borderRadius="md"
              bg="var(--color-primary)"
              color="var(--color-white)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <LuUserRound size={16} />
            </Box>
            <VStack align="flex-start" gap={0}>
              <Text fontSize="xs" color="var(--color-primary)" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Client</Text>
              <Text fontWeight="700" fontSize="md" color="var(--color-black)" lineHeight="1.3">{t.client_name}</Text>
            </VStack>
          </HStack>
        )}
      </Box>
      {/* Tender details */}
      <Box
        px={4}
        py={3}
        bg="var(--color-very-light-gray)"
        borderTopWidth="1px"
        borderTopColor="var(--color-gray)"
        fontSize="sm"
      >
        <HStack gap={6} flexWrap="wrap" alignItems="center" rowGap={2}>
          <HStack gap={1.5}>
            <Text color="var(--color-dark-gray)">Status:</Text>
            <Box w="2" h="2" borderRadius="full" bg={isOpen ? 'var(--color-success)' : 'var(--color-dark-gray)'} />
            <Text fontWeight="600" color="var(--color-black)" textTransform="capitalize">{t.tender_status || '—'}</Text>
          </HStack>
          {(t.publication_type_label || t.publication_type_code) && (
            <HStack gap={1.5}>
              <Text color="var(--color-dark-gray)">Publication:</Text>
              <Text fontWeight="500" color="var(--color-black)" textTransform="capitalize">{t.publication_type_label || t.publication_type_code}</Text>
            </HStack>
          )}
          {t.contract_nature && (
            <HStack gap={1.5}>
              <Text color="var(--color-dark-gray)">Type:</Text>
              <Text fontWeight="600" color="var(--color-black)" textTransform="capitalize">{t.contract_nature}</Text>
            </HStack>
          )}
          {t.procedure_label && (
            <HStack gap={1.5}>
              <Text color="var(--color-dark-gray)">Procedure:</Text>
              <Text fontWeight="500" color="var(--color-black)" textTransform="capitalize">{t.procedure_label}</Text>
            </HStack>
          )}
          {t.platform && (
            <HStack gap={1.5}>
              <Text color="var(--color-dark-gray)">Platform:</Text>
              <Text fontWeight="500" color="var(--color-black)" textTransform="capitalize">{t.platform}</Text>
            </HStack>
          )}
        </HStack>
        <HStack gap={5} flexWrap="wrap" alignItems="center" mt={3} rowGap={2}>
          {cpvDisplay !== '—' && (
            <HStack gap={1.5} flex="1" minW={{ base: '100%', md: '200px' }} alignItems="baseline">
              <Text color="var(--color-dark-gray)" flexShrink={0}>CPV:</Text>
              <Text fontWeight="500" color="var(--color-black)" noOfLines={1} title={cpvDisplay} textTransform="capitalize">{cpvDisplay}</Text>
            </HStack>
          )}
          <HStack gap={2} flexWrap="wrap">
            {t.is_european != null && (
              <Badge size="sm" fontWeight="600" px={2} py={0.5} textTransform="capitalize" style={{ background: 'var(--color-secondary)', color: 'var(--color-white)', border: 'none' }}>
                EU tender: {t.is_european ? 'Yes' : 'No'}
              </Badge>
            )}
            {t.is_digital_submission_possible != null && (
              <Badge size="sm" fontWeight="600" px={2} py={0.5} textTransform="capitalize" style={{ background: 'var(--color-primary)', color: 'var(--color-white)', border: 'none' }}>
                Digital submission: {t.is_digital_submission_possible ? 'Yes' : 'No'}
              </Badge>
            )}
          </HStack>
        </HStack>
      </Box>
    </Box>
  )
}

export default memo(TenderCard)
