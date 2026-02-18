'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { LuArrowLeft, LuBell, LuUserRound, LuCalendar, LuCircleAlert, LuMonitor, LuMonitorOff } from 'react-icons/lu'
import { FaLinkedin } from 'react-icons/fa'
import { Button } from '@/elements/button'
import { Badge } from '@/elements/badge'
import { formatTenderDateLong, getRegistrationDaysText } from '../variables'
import { useGlobal } from '@/context'
import { SIDENAV_WIDTH_COLLAPSED, SIDENAV_WIDTH_EXPANDED } from '@/elements/sidenav'

function TenderDetailHeader({ tender, onHeightChange }) {
  const headerRef = useRef(null)
  const { sidenavCollapsed } = useGlobal()
  const dateLong = formatTenderDateLong(tender?.processing_time ?? tender?.publication_datetime)
  const publicationLabel = tender?.publication_type_label ?? ''
  const topLine = [dateLong, publicationLabel].filter(Boolean).join(' — ')
  const registrationText = getRegistrationDaysText(tender?.closing_date)

  useEffect(() => {
    const el = headerRef.current
    if (!el || typeof onHeightChange !== 'function') return
    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect?.height
      if (typeof height === 'number') onHeightChange(height)
    })
    observer.observe(el)
    onHeightChange(el.getBoundingClientRect().height)
    return () => observer.disconnect()
  }, [onHeightChange])

  const openUrl = (path) => {
    const url = path?.startsWith('http') ? path : path ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}${path.startsWith('/') ? '' : '/'}${path}` : ''
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  const sidebarOffset = sidenavCollapsed ? SIDENAV_WIDTH_COLLAPSED : SIDENAV_WIDTH_EXPANDED

  return (
    <Box
      ref={headerRef}
      position="fixed"
      top={{ base: '56px', md: '56px' }}
      left={{ base: 0, lg: `${sidebarOffset}px` }}
      right={0}
      zIndex={10}
      flexShrink={0}
      bg="var(--color-white)"
      borderWidth="1px"
      borderColor="var(--color-gray)"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(var(--color-primary-rgb), 0.06)"
      transition="box-shadow 0.2s ease, left 0.18s ease"
      
    >
      {/* Gradient accent bar */}
      {/* <Box
        h="4px"
        flexShrink={0}
        bg="linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)"
        boxShadow="0 2px 8px rgba(var(--color-primary-rgb), 0.2)"
      /> */}

      <Box px={{ base: 4, md: 6 }} py={{ base: 4, md: 14 }}>
        <VStack align="stretch" gap={5}>
          {/* Back to overview */}
          <Box
            as={Link}
            href="/app/tenders"
            display="inline-flex"
            alignItems="center"
            gap={2}
            fontSize="sm"
            fontWeight="600"
            color="var(--color-primary)"
            textUnderlineOffset={2}
            transition="color 0.2s"
            _hover={{ color: 'var(--color-secondary)' }}
            role="group"
          >
            <Box
              as={LuArrowLeft}
              size={18}
              transition="transform 0.2s"
              _groupHover={{ transform: 'translateX(-2px)' }}
            />
            Back to overview
          </Box>

          <HStack
            align={{ base: 'flex-start', lg: 'flex-end' }}
            justify="space-between"
            gap={6}
            flexWrap={{ base: 'wrap', lg: 'nowrap' }}
          >
            {/* Left: info block */}
            <VStack align="stretch" gap={2} flex="1" minW={0}>
              {topLine && (
                <HStack gap={2} align="center">
                  <Box as={LuCalendar} size={16} color="var(--color-dark-gray)" opacity={0.9} flexShrink={0} />
                  <Text
                    fontSize="xs"
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color="var(--color-dark-gray)"
                    opacity={0.9}
                    lineHeight="1.4"
                  >
                    {topLine}
                  </Text>
                </HStack>
              )}
              <Text
                fontWeight="800"
                fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                color="var(--color-black)"
                lineHeight="1.2"
                letterSpacing="-0.02em"
              >
                {tender?.title ?? '—'}
              </Text>
              {tender?.client_name && (
                <HStack gap={2} mt={0.5} align="center">
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
                    <Text fontSize="sm" color="var(--color-dark-gray)" fontWeight="500">
                      {tender?.client_name}
                    </Text>
                  </VStack>
                </HStack>
              )}
              {/* Digital submission badge — below client */}
              {tender?.is_digital_submission_possible === true && (
                <Badge
                  mt={2}
                  variant="solid"
                  w="fit-content"
                  colorPalette="green"
                  size="sm"
                  display="inline-flex"
                  alignItems="center"
                  gap={1.5}
                  px={3}
                  rounded="full"
                  py={1.5}
                  textTransform="none"
                >
                  <HStack as="span" gap={1.5} display="inline-flex" alignItems="center">
                    <LuMonitor size={15} style={{ flexShrink: 0 }} />
                    <span>Digital submission possible</span>
                  </HStack>
                </Badge>
              )}
              {tender?.is_digital_submission_possible === false && (
                <Badge
                mt={2}
                variant="solid"
                w="fit-content"
                colorPalette="gray"
                size="sm"
                display="inline-flex"
                alignItems="center"
                gap={1.5}
                px={3}
                rounded="full"
                py={1.5}
                textTransform="none"
                >
                  <HStack as="span" gap={1.5} display="inline-flex" alignItems="center">
                    <LuMonitorOff size={14} style={{ flexShrink: 0 }} />
                    <span>Digital submission not possible</span>
                  </HStack>
                </Badge>
              )}
              {registrationText && (
                <Box mt={2}>
                  <Text fontSize="sm" color="var(--color-dark-gray)" lineHeight="1.5">
                    {registrationText.split(/(\d+)/).map((part, i) =>
                      /^\d+$/.test(part) ? (
                        <Text as="span" key={i} fontWeight="700" color="var(--color-primary)">
                          {part}
                        </Text>
                      ) : (
                        part
                      )
                    )}
                  </Text>
                </Box>
              )}
               {tender?.is_terminated_early && (
            <Box
              mt={2}
            >
              <HStack align="flex-start" gap={3}>
                <Box>
                  <Text fontSize="sm" fontWeight={600} color="var(--color-dark-gray)" lineHeight="1.5">
                  It is no longer possible to register for this tender
                  </Text>
                </Box>
              </HStack>
            </Box>
          )}
            </VStack>

            {/* Right: action buttons */}
            <HStack gap={3} flexShrink={0} flexWrap="wrap" align="flex-end">
              {tender?.add_to_tenders && (
                <Button
                  size="md"
                  variant="solid"
                  colorScheme="primary"
                  onClick={() => openUrl(tender?.add_to_tenders)}
                  bg="linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)"
                  color="var(--color-white)"
                  border="none"
                  boxShadow="0 2px 8px rgba(var(--color-primary-rgb), 0.25)"
                  _hover={{
                    bg: 'linear-gradient(135deg, #1a5bc7 0%, #5d3fdc 100%)',
                    boxShadow: '0 4px 12px rgba(var(--color-primary-rgb), 0.35)',
                  }}
                >
                  <LuCalendar size={18} /> Add to Tenders
                </Button>
              )}
              {tender?.keep_informed_url && (
                <Button
                  size="md"
                  variant="outline"
                  onClick={() => openUrl(tender?.keep_informed_url)}
                  bg="var(--color-white)"
                  color="var(--color-secondary)"
                  borderWidth="2px"
                  borderColor="var(--color-secondary)"
                  _hover={{
                    bg: 'rgba(107, 78, 255, 0.06)',
                  }}
                >
                  <LuBell size={18} /> Stay informed
                </Button>
              )}
              {tender?.share_on_linkedin && (
                <Button
                  size="md"
                  variant="outline"
                  onClick={() => openUrl(tender?.share_on_linkedin)}
                  bg="var(--color-white)"
                  color="var(--color-primary)"
                  borderWidth="2px"
                  borderColor="var(--color-primary)"
                  _hover={{
                    bg: 'rgba(31, 106, 225, 0.06)',
                  }}
                >
                  <FaLinkedin size={18} /> Share on LinkedIn
                </Button>
              )}
            </HStack>
          </HStack>

             
        </VStack>
      </Box>
    </Box>
  )
}

export default TenderDetailHeader
