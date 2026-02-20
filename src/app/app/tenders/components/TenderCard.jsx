'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react'
import { Button } from '@/elements/button'
import { IconButton } from '@/elements/icon-button'
import { Tooltip } from '@/elements/tooltip'
import {
  LuMapPin,
  LuClock,
  LuBriefcase,
  LuBox,
  LuBuilding2,
  LuCalendar,
  LuConstruction,
  LuExternalLink,
  LuEye,
  LuFileText,
  LuHandshake,
  LuMonitor,
  LuTarget,
  LuBookmark,
} from 'react-icons/lu'
import { FaSackDollar } from 'react-icons/fa6'
import {
  formatTenderCurrency,
  formatTenderDate,
  getClosesInText,
  getMatchPercentage,
  getDeadlineColor,
  getContractNatureKey,
  CONTRACT_NATURE_ICON_COLOR,
} from '../variables'

const CONTRACT_NATURE_ICONS = {
  works: LuConstruction,
  services: LuBriefcase,
  supplies: LuBox,
}

/** 5 colors for procedure_label; pick by (label.length % 5) so any label gets a consistent color */
const PROCEDURE_LABEL_COLORS = [
  '#2563eb', // blue
  '#059669', // emerald
  '#7c3aed', // violet
  '#dc2626', // red
  '#ea580c', // orange
]

const TenderCard = ({
  t,
  cpvDisplay: cpvDisplayProp = null,
  isBookmarked = false,
  onSaveClick,
  saveDisabled = false,
  matchResult = null,
  onMatchBreakdownClick = null,
}) => {
  const cpvDisplay = cpvDisplayProp ?? t?.cpv_main ?? '—'
  const budgetLabel =
    t?.estimated_value_amount != null && t.estimated_value_amount !== ''
      ? formatTenderCurrency(t.estimated_value_amount)
      : 'Not Provided'
  const regionLabel = t?.is_european === true ? 'EU' : 'NL'
  const regionTooltip = regionLabel === 'EU' ? 'European procedure' : 'National procedure'
  const closesInText = getClosesInText(t?.closing_date ?? '') ?? 'NVT'
  const deadlineColor = t?.closing_date ? getDeadlineColor(t.closing_date) : 'var(--color-dark-gray)'
  const matchPct = matchResult != null && typeof matchResult.overallPercentage === 'number'
    ? matchResult.overallPercentage
    : getMatchPercentage(t?.tender_id)
  const recommendation =
    matchResult?.recommendation ??
    (matchPct >= 75 ? 'GO' : matchPct >= 45 ? 'PARTNER' : 'NO-GO')
  const matchBreakdownText =
    matchResult?.breakdown &&
    [
      `CPV: ${matchResult.breakdown.cpv?.points ?? '—'}/100`,
      `Region: ${matchResult.breakdown.region?.points ?? '—'}/100`,
      `Contract type: ${matchResult.breakdown.contractType?.points ?? '—'}/100`,
      `Contract value: ${matchResult.breakdown.contractValue?.points ?? '—'}/100`,
      `Certification: ${matchResult.breakdown.certification?.points ?? '—'}/100`,
      `Portfolio: ${matchResult.breakdown.portfolio?.points ?? '—'}/100`,
    ].join(' · ')
  const contractNatureKey = getContractNatureKey(t?.contract_nature)
  const ContractNatureIcon = CONTRACT_NATURE_ICONS[contractNatureKey] ?? LuBriefcase

  const detailHref = t?.tender_id ? `/app/tenders/${t.tender_id}` : null
  // const statusLabel = t?.tender_status ? String(t.tender_status).toUpperCase() : '—'
  // const statusBadgeBg = getStatusBadgeBg(t?.tender_status)
  const tendernedUrl = t?.tenderned_url ?? null
  const procedureLabelColor =
    t?.procedure_label != null
      ? PROCEDURE_LABEL_COLORS[String(t.procedure_label).length % PROCEDURE_LABEL_COLORS.length]
      : PROCEDURE_LABEL_COLORS[0]

 

  const handleSaveClick = (e) => {
    e?.stopPropagation()
    onSaveClick?.()
  }

  const matchBreakdownDescriptions = matchResult?.breakdown
    ? [
        {
          label: 'CPV (sector)',
          maxPoints: 40,
          points: matchResult.breakdown.cpv?.points ?? '—',
          description: 'How well the tender’s main sector (CPV code) aligns with your company profile and the types of work you do.',
        },
        {
          label: 'Region',
          maxPoints: 15,
          points: matchResult.breakdown.region?.points ?? '—',
          description: 'Whether the tender’s geographic scope matches your preferred regions and where you can deliver.',
        },
        {
          label: 'Contract type',
          maxPoints: 10,
          points: matchResult.breakdown.contractType?.points ?? '—',
          description: 'How well the contract nature (works, services, or supplies) fits your capabilities.',
        },
        {
          label: 'Contract value',
          maxPoints: 15,
          points: matchResult.breakdown.contractValue?.points ?? '—',
          description: 'Whether the estimated value is in a range that matches your company size and experience.',
        },
        {
          label: 'Certification',
          maxPoints: 10,
          points: matchResult.breakdown.certification?.points ?? '—',
          description: 'How your certifications and qualifications compare to what the tender requires.',
        },
        {
          label: 'Portfolio',
          maxPoints: 10,
          points: matchResult.breakdown.portfolio?.points ?? '—',
          description: 'How relevant your past projects and experience are to this tender.',
        },
      ]
    : []

  return (
    <Box
      as="article"
      bg="var(--color-white)"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="var(--color-gray)"
      overflow="hidden"
      boxShadow="0 1px 3px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)"
      transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 28px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)',
        borderColor: 'var(--color-primary)',
      }}
    >
      {/* Top header: full-height bar; procedure pill and items stretch to fill */}
      <HStack
        align="stretch"
        minH="44px"
        py={0}
        bg="var(--color-very-light-gray)"
        borderBottomWidth="1px"
        borderBottomColor="var(--color-gray)"
        flexWrap="wrap"
      >
        {t?.procedure_label && (
          <HStack
            align="center"
            px={3}
            gap={1.5}
            fontWeight="700"
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="wider"
            color="white"
            bg={procedureLabelColor}
            border="none"
            borderRadius="8px 30px 30px 0px"
            flexShrink={0}
          >
            <LuTarget size={12} />
            <Text as="span">{t.procedure_label}</Text>
          </HStack>
        )}
        {/* Tender status — commented out
        <Badge
          alignSelf="center"
          gap={1}
          px={2.5}
          py={1.5}
          ml={3}
          fontWeight="700"
          fontSize="xs"
          textTransform="uppercase"
          letterSpacing="wider"
          color="white"
          bg={statusBadgeBg}
          border="none"
          borderRadius="full"
          flexShrink={0}
        >
          <LuTarget size={12} />
          <Text as="span">{statusLabel}</Text>
        </Badge>
        */}

        <HStack gap={1.5} px={3} py={1.5} ml={t?.procedure_label ? 3 : 0} flexShrink={0} color={deadlineColor}>
          <LuClock size={14} style={{ color: deadlineColor }} />
          <Text fontSize="xs" fontWeight="600" color={deadlineColor}>
            {closesInText}
          </Text>
        </HStack>

        <HStack gap={1.5} px={3} py={1.5} flexShrink={0} color="#ea580c">
          <FaSackDollar size={14} style={{ flexShrink: 0 }} />
          <Text fontSize="xs" fontWeight="600" color="#ea580c">{budgetLabel}</Text>
        </HStack>

        <Tooltip content={regionTooltip}>
          <HStack gap={1} px={3} py={1.5} flexShrink={0} as="span" display="inline-flex" cursor="help">
            <Text as="span" fontSize="md" lineHeight={1} role="img" aria-label={regionLabel === 'EU' ? 'European Union flag' : 'Netherlands flag'}>
              {regionLabel === 'EU' ? '🇪🇺' : '🇳🇱'}
            </Text>
            <Text fontSize="xs" fontWeight="700" color="var(--color-black)">{regionLabel}</Text>
          </HStack>
        </Tooltip>

        <Box flex="1" minW={2} />

        {/* Publication + Deadline in header */}
        <HStack gap={3} px={3} py={1.5} flexShrink={0} fontSize="xs">
          {t?.publication_datetime && (
            <HStack gap={1}>
              <LuCalendar size={12} style={{ color: 'var(--color-primary)' }} />
              <Text fontWeight="600" color="var(--color-dark-gray)">Published Date:</Text>
              <Text fontWeight="700" color="var(--color-black)">{formatTenderDate(t.publication_datetime)}</Text>
            </HStack>
          )}
          {t?.closing_date && (
            <HStack gap={1}>
              <LuClock size={12} style={{ color: 'var(--color-primary)' }} />
              <Text fontWeight="600" color="var(--color-dark-gray)">Due Date:</Text>
              <Text fontWeight="700" color="var(--color-black)">{formatTenderDate(t.closing_date)}</Text>
            </HStack>
          )}
        </HStack>
      </HStack>

      <HStack align="stretch" gap={0} flexWrap={{ base: 'wrap', lg: 'nowrap' }}>
        {/* Left: title, tags, actions */}
        <VStack align="stretch" flex="1" minW={0} p={4} gap={3}>
          <Text fontWeight="800" fontSize="lg" color="var(--color-black)" lineHeight="1.3" lineClamp={2}>
            {t?.title || '—'}
          </Text>

          {t?.description != null && String(t.description).trim() !== '' && (
            <Text maxW="75%" fontSize="sm" color="var(--color-dark-gray)" lineHeight="1.5" lineClamp={2}>
              {t.description.trim()}
            </Text>
          )}

          {/* Detail row: type, issuer, location, platform, CPV — with separators and colored icons */}
          <HStack gap={0} flexWrap="wrap" fontSize="sm" alignItems="center" rowGap={2}>
            <HStack gap={1.5} pr={4} borderRightWidth="1px" borderRightColor="var(--color-gray)" borderRightStyle="solid">
              <ContractNatureIcon size={16} style={{ flexShrink: 0, color: CONTRACT_NATURE_ICON_COLOR }} />
              <Text fontWeight="500" color="var(--color-black)" textTransform="capitalize">{t?.contract_nature || 'Services'}</Text>
            </HStack>
            {t?.client_name && (
              <HStack gap={1.5} px={4} borderRightWidth="1px" borderRightColor="var(--color-gray)" borderRightStyle="solid">
                <LuBuilding2 size={16} style={{ flexShrink: 0, color: '#2563eb' }} />
                <Text fontWeight="500" color="var(--color-black)" noOfLines={1}>{t.client_name}</Text>
              </HStack>
            )}
            {t?.nut_label && (
              <HStack gap={1.5} px={4} borderRightWidth="1px" borderRightColor="var(--color-gray)" borderRightStyle="solid">
                <LuMapPin size={16} style={{ flexShrink: 0, color: '#dc2626' }} />
                <Text fontWeight="500" color="var(--color-black)" noOfLines={1}>{t.nut_label}</Text>
              </HStack>
            )}
            {t?.platform && (
              <HStack gap={1.5} px={4} borderRightWidth="1px" borderRightColor="var(--color-gray)" borderRightStyle="solid">
                <LuMonitor size={16} style={{ flexShrink: 0, color: '#7c3aed' }} />
                <Text fontWeight="500" color="var(--color-black)" noOfLines={1}>{t.platform}</Text>
              </HStack>
            )}
            {cpvDisplay && cpvDisplay !== '—' && (
              <HStack gap={1.5} px={4} borderRightWidth="1px" borderRightColor="var(--color-gray)" borderRightStyle="solid">
                <LuBriefcase size={16} style={{ flexShrink: 0, color: 'var(--color-dark-gray)' }} />
                <Text fontWeight="500" color="var(--color-black)" noOfLines={1} title={cpvDisplay}>CPV: {cpvDisplay}</Text>
              </HStack>
            )}
          </HStack>

          {/* Action buttons */}
          <HStack
            gap={2}
            pt={3}
            mt={2}
            borderTopWidth="1px"
            borderTopColor="var(--color-gray)"
            flexWrap="wrap"
          >
            <Button
              as="span"
              size="sm"
              variant="outline"
              borderRadius="lg"
              cursor="pointer"
              onClick={handleSaveClick}
              fontWeight="500"
              borderColor={isBookmarked ? 'var(--color-primary)' : 'var(--color-gray)'}
              color={isBookmarked ? 'var(--color-primary)' : undefined}
              bg={isBookmarked ? 'var(--color-very-light-gray)' : undefined}
              isDisabled={saveDisabled}
              _hover={!saveDisabled ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : undefined}
            >
              <HStack gap={2} as="span" display="inline-flex">
                <LuBookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                <Text as="span">{isBookmarked ? 'Saved' : 'Save'}</Text>
              </HStack>
            </Button>
            {detailHref && (
              <Link href={detailHref}>
                <Button
                  as="span"
                  size="sm"
                  variant="outline"
                  borderRadius="lg"
                  cursor="pointer"
                  fontWeight="500"
                  borderColor="var(--color-gray)"
                  _hover={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                >
                  <HStack gap={2} as="span" display="inline-flex">
                    <LuHandshake size={16} />
                    <Text as="span">Find Match</Text>
                  </HStack>
                </Button>
              </Link>
            )}
            {detailHref && (
              <Link href={detailHref}>
                <Button
                  as="span"
                  size="sm"
                  variant="solid"
                  colorScheme="primary"
                  borderRadius="lg"
                  cursor="pointer"
                  fontWeight="600"
                  display="inline-flex"
                >
                  <HStack gap={2} as="span" display="inline-flex">
                    <LuEye size={16} />
                    <Text as="span">View Details</Text>
                  </HStack>
                </Button>
              </Link>
            )}
            {tendernedUrl && (
              <Box
                as="a"
                href={tendernedUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                _hover={{ textDecoration: 'none' }}
                cursor="pointer"
              >
                <Button
                  as="span"
                  size="sm"
                  variant="outline"
                  borderRadius="lg"
                  cursor="pointer"
                  fontWeight="500"
                  borderColor="var(--color-gray)"
                  _hover={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                >
                  <HStack gap={2} as="span" display="inline-flex">
                    <LuExternalLink size={16} />
                    <Text as="span">View on TenderNed</Text>
                  </HStack>
                </Button>
              </Box>
            )}
          </HStack>
        </VStack>

        {/* Right: match gauge — SVG with gradient; below it, recommendation button */}
        <VStack
          flex="0 0 136px"
          align="center"
          justify="center"
          py={4}
          pr={4}
          spacing={3}
          sx={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.03) 0%, transparent 50%)',
          }}
        >
          <Tooltip content={matchBreakdownText || 'View match breakdown'}>
          <Box
            position="relative"
            w="104px"
            h="104px"
            flexShrink={0}
            cursor="help"
            _hover={matchBreakdownText ? { opacity: 0.9 } : undefined}
          >
            <svg
              width="104"
              height="104"
              viewBox="0 0 104 104"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <defs>
                <linearGradient
                  id={`matchGradHigh-${t?.tender_id ?? 0}`}
                  gradientUnits="objectBoundingBox"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                  gradientTransform="rotate(120 0.5 0.5)"
                >
                  <stop offset="0%" stopColor="#d4fc79" />
                  <stop offset="100%" stopColor="#96e6a1" />
                </linearGradient>
                <linearGradient
                  id={`matchGradLow-${t?.tender_id ?? 0}`}
                  gradientUnits="objectBoundingBox"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                  gradientTransform="rotate(120 0.5 0.5)"
                >
                  <stop offset="0%" stopColor="#f6d365" />
                  <stop offset="100%" stopColor="#fda085" />
                </linearGradient>
              </defs>
              <circle
                cx="52"
                cy="52"
                r="46"
                fill="none"
                stroke="var(--color-very-light-gray)"
                strokeWidth="10"
              />
              <circle
                cx="52"
                cy="52"
                r="46"
                fill="none"
                stroke={matchPct >= 80 ? `url(#matchGradHigh-${t?.tender_id ?? 0})` : `url(#matchGradLow-${t?.tender_id ?? 0})`}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(matchPct / 100) * 289.03} 289.03`}
                style={{ transition: 'stroke-dasharray 0.4s ease' }}
              />
            </svg>
            <Box
              position="absolute"
              inset={0}
              display="flex"
              flexDir="column"
              alignItems="center"
              justifyContent="center"
              pointerEvents="none"
            >
              <Text fontWeight="800" fontSize="xl" color="var(--color-black)">{matchPct}%</Text>
              <Text fontSize="xs" fontWeight="700" color="var(--color-dark-gray)" textTransform="uppercase" letterSpacing="wider">Match</Text>
            </Box>
          </Box>
          </Tooltip>
          <Button
            size="sm"
            variant="solid"
            colorScheme={recommendation === 'GO' ? 'green' : recommendation === 'PARTNER' ? 'orange' : 'gray'}
            fontWeight="700"
            letterSpacing="wider"
            textTransform="uppercase"
            fontSize="xs"
            minW="72px"
          pointerEvents="cursor"
         
          >
            {recommendation}
          </Button>
        </VStack>
      </HStack>
    </Box>
  )
}

export default memo(TenderCard)
