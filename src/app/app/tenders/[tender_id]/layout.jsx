'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Box, Text, HStack, VStack } from '@chakra-ui/react'
import { LuInfo, LuCircleAlert, LuArrowLeft } from 'react-icons/lu'
import { Loading } from '@/elements/loading'

import TenderDetailHeader from '../components/TenderDetailHeader'
import TenderTabNav from '../components/TenderTabNav'
import { TenderDetailProvider } from './context/TenderDetailContext'

export default function TenderDetailLayout({ children }) {
  const params = useParams()
  const tenderId = params?.tender_id ?? null
  const [tender, setTender] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [headerHeight, setHeaderHeight] = useState(340)

  const fetchTender = useCallback(async () => {
    if (!tenderId || !supabase) return

    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('tenders')
        .select('*')
        .eq('tender_id', tenderId)
        .maybeSingle()

      if (err) {
        console.error('Tender fetch error:', err)
        setError(err.message)
        setTender(null)
        return
      }

      setTender(data)
    } catch (err) {
      console.error(err)
      setError(err?.message ?? 'Failed to load tender')
      setTender(null)
    } finally {
      setLoading(false)
    }
  }, [tenderId])

  useEffect(() => {
    fetchTender()
  }, [fetchTender])

  const contextValue = {
    tenderId,
    tender,
    loading,
    error,
  }

  return (
    <TenderDetailProvider value={contextValue}>
      <Box
        minH="100dvh"
        display="flex"
        flexDirection="column"
        bg="var(--color-off-white)"
      >
        <Box w="full" mx="auto" minH="100dvh" display="flex" flexDirection="column">
          {loading && <Loading message="Loading tender..." />}
{!loading && (error || !tender) && (
            <Box p={6} display="flex" alignItems="center" justifyContent="center" minH="100dvh">
              <VStack gap={6} align="center">
                <Box
                  as={Link}
                  href="/app/tenders"
                  alignSelf="flex-start"
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
                <Text fontSize="lg" color="var(--color-dark-gray)" fontWeight="600" textAlign="center">
                  The tender detail for this tender is not available. Please try again later.
                </Text>
              </VStack>
            </Box>
          )}
          {!loading && !error && tender && (
            <Box
              pt={`${headerHeight}px`}
              px={{ base: 2, md: 4 }}
              pb={{ base: 2, md: 4 }}
              minH="100dvh"
              display="block"
            >
              <TenderDetailHeader tender={tender} onHeightChange={setHeaderHeight} />
                {tender?.is_imported && (
                  <Box
                    mb={3}
                    px={4}
                    py={3}
                    bg="rgba(234, 179, 8, 0.12)"
                    borderWidth="1px"
                    borderColor="rgba(234, 179, 8, 0.4)"
                    borderRadius="lg"
                  >
                    <HStack align="flex-start" gap={3}>
                      <Box flexShrink={0} color="rgb(202, 138, 4)" mt={0.5}>
                        <LuInfo size={20} />
                      </Box>
                      <Text fontSize="sm" color="var(--color-black)" lineHeight="1.5">
                        This is an imported announcement. Therefore, it is not possible to add this tender to My Tenders. For more information about this tender, please visit the{' '}
                        <Text
                          as="a"
                          href={tender.tender_url ?? tender.tsender_url ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          fontWeight="600"
                          color="var(--color-primary)"
                          _hover={{ textDecoration: 'underline' }}
                        >
                          Mercell
                        </Text>
                        {' '}website.
                      </Text>
                    </HStack>
                  </Box>
                )}
                {tender?.is_terminated_early && (
                  <Box
                    mb={4}
                    px={6}
                    py={2}
                    bg="rgba(220, 38, 38, 0.08)"
                    borderWidth="1px"
                    borderColor="rgba(220, 38, 38, 0.3)"
                    borderRadius="lg"
                    w={"fit-content"}
                  >
                    <HStack align="flex-start" gap={3}>
                      <Box flexShrink={0} color="#dc2626" mt={0.5}>
                        <LuCircleAlert size={20} />
                      </Box>
                      <Box>
                        <Text fontSize="sm" fontWeight="700" color="var(--color-black)" mb={1}>
                          Please note, this tender has ended
                        </Text>
                        <Text fontSize="sm" color="var(--color-dark-gray)" lineHeight="1.5">
                          This tender was terminated early by the contracting authority. See the publication of this early termination for more information.
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                )}
                {tenderId && <TenderTabNav tenderId={tenderId} />}
                <Box
                  as="main"
                  pt={0}
                  overflowX="hidden"
                  display="block"
                 
                >
                  {children}
                </Box>
              </Box>
            
          )}
        </Box>
      </Box>
    </TenderDetailProvider>
  )
}
