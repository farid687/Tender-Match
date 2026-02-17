'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTenderDetail } from '../context/TenderDetailContext'
import { supabase } from '@/lib/supabase'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleIndicator,
} from '@chakra-ui/react'
import { LuMegaphone, LuChevronDown } from 'react-icons/lu'
import { Loading } from '@/elements/loading'
import moment from 'moment'

function getLotLabel(lots) {
  if (!lots) return null
  if (Array.isArray(lots)) {
    const titles = lots.map((l) => l?.titel ?? l?.title).filter(Boolean)
    return titles.length ? titles.join(', ') : null
  }
  return lots?.titel ?? lots?.title ?? null
}

function formatAnnouncementDate(dateStr) {
  if (!dateStr) return '—'
  const d = moment(dateStr)
  if (!d.isValid()) return String(dateStr)
  return d.format('MMMM D, YYYY')
}

function AnnouncementCard({ item, index, open, onOpenChange }) {
  const triggerLabel = [item.reference_number, item.subject].filter((v) => v != null && String(v).trim() !== '').join(' ') || `Announcement ${index + 1}`
  const lotLabel = getLotLabel(item.lots)

  return (
    <CollapsibleRoot open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger
        py={4}
        px={5}
        width="100%"
        textAlign="left"
        bg="var(--color-very-light-gray)"
        borderBottomWidth="1px"
        borderBottomColor="var(--color-gray)"
        _hover={{ bg: 'var(--color-gray)' }}
        transition="background 0.15s, border-color 0.15s"
        _open={{ bg: 'var(--color-white)', borderBottomColor: 'transparent' }}
      >
        <HStack justify="space-between" gap={4}>
          <Text fontSize="md" fontWeight="700" color="var(--color-black)" noOfLines={2}>
            {triggerLabel}
          </Text>
          <Box flexShrink={0} color="var(--color-dark-gray)" transition="transform 0.2s" _open={{ transform: 'rotate(180deg)' }}>
            <CollapsibleIndicator>
              <LuChevronDown size={20} />
            </CollapsibleIndicator>
          </Box>
        </HStack>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Box px={5} py={4} bg="var(--color-white)" borderBottomWidth="1px" borderBottomColor="var(--color-gray)">
          <VStack align="stretch" gap={4}>
            <Box>
              <Text fontSize="xs" fontWeight="700" color="var(--color-dark-gray)" textTransform="uppercase" letterSpacing="wider" mb={1}>
                Date added on
              </Text>
              <Text fontSize="sm" color="var(--color-black)">
                {formatAnnouncementDate(item.created_at_source)}
              </Text>
            </Box>
            {lotLabel && (
              <Box>
                <Text fontSize="xs" fontWeight="700" color="var(--color-dark-gray)" textTransform="uppercase" letterSpacing="wider" mb={1}>
                  Applicable to plots
                </Text>
                <Text fontSize="sm" color="var(--color-black)">
                  {lotLabel}
                </Text>
              </Box>
            )}
            {item.subject != null && String(item.subject).trim() !== '' && (
              <Box>
                <Text fontSize="xs" fontWeight="700" color="var(--color-dark-gray)" textTransform="uppercase" letterSpacing="wider" mb={1}>
                  Subject
                </Text>
                <Text fontSize="sm" color="var(--color-black)">
                  {item.subject}
                </Text>
              </Box>
            )}
            {item.message_text != null && String(item.message_text).trim() !== '' && (
              <Box>
                <Text fontSize="xs" fontWeight="700" color="var(--color-dark-gray)" textTransform="uppercase" letterSpacing="wider" mb={1}>
                  Notification
                </Text>
                <Text fontSize="sm" color="var(--color-black)" lineHeight="1.6" whiteSpace="pre-wrap">
                  {item.message_text}
                </Text>
              </Box>
            )}
            {item.information_notice != null && String(item.information_notice).trim() !== '' && (
              <Box>
                <Text fontSize="xs" fontWeight="700" color="var(--color-dark-gray)" textTransform="uppercase" letterSpacing="wider" mb={1}>
                  Note of information
                </Text>
                <Text fontSize="sm" color="var(--color-black)">
                  {item.information_notice}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}

export default function TenderAnnouncementsPage() {
  const { tenderId } = useTenderDetail()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openIndex, setOpenIndex] = useState(0)

  const fetchAnnouncements = useCallback(async () => {
    if (!tenderId || !supabase) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('announcements')
        .select('*')
        .eq('tender_id', tenderId)
        .order('reference_number', { ascending: true })

      if (err) {
        console.error('Announcements fetch error:', err)
        setError(err.message)
        setAnnouncements([])
        return
      }
      setAnnouncements(data ?? [])
    } catch (err) {
      console.error(err)
      setError(err?.message ?? 'Failed to load announcements')
      setAnnouncements([])
    } finally {
      setLoading(false)
    }
  }, [tenderId])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  if (loading) return <Loading message="Loading announcements..." />
  if (error) {
    return (
      <Box p={4}>
        <Text color="var(--color-dark-gray)">Unable to load announcements. {error}</Text>
      </Box>
    )
  }

  return (
    <Box
      bg="var(--color-white)"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="var(--color-gray)"
     
      boxShadow="0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(var(--color-primary-rgb), 0.06)"
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
          <LuMegaphone size={20} />
        </Box>
        <Text fontSize="lg" fontWeight="800" color="var(--color-black)" letterSpacing="-0.02em">
          Announcements
        </Text>
        <Text fontSize="sm" color="var(--color-dark-gray)">
          {announcements.length} {announcements.length === 1 ? 'announcement' : 'announcements'}
        </Text>
      </HStack>

      {announcements.length === 0 ? (
        <Box px={5} py={8} textAlign="center">
          <Text color="var(--color-dark-gray)">No announcements for this tender.</Text>
        </Box>
      ) : (
        <VStack align="stretch" gap={0}>
          {announcements.map((item, index) => (
            <AnnouncementCard
              key={item.id ?? index}
              item={item}
              index={index}
              open={openIndex === index}
              onOpenChange={(e) => setOpenIndex(e.open ? index : null)}
            />
          ))}
        </VStack>
      )}
    </Box>
  )
}
