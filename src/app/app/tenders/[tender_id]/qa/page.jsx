'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTenderDetail } from '../context/TenderDetailContext'
import { supabase } from '@/lib/supabase'
import { Box, Text, VStack, HStack, SimpleGrid } from '@chakra-ui/react'
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleIndicator,
} from '@chakra-ui/react'
import { LuMessageCircleQuestion, LuChevronDown, LuFilter, LuCheck } from 'react-icons/lu'
import { Checkbox } from '@/elements/checkbox'
import { Button } from '@/elements/button'
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

function formatQaDate(dateStr) {
  if (!dateStr) return '—'
  const d = moment(dateStr)
  if (!d.isValid()) return String(dateStr)
  return d.format('MMMM D, YYYY')
}

function QACard({ item, index, open, onOpenChange }) {
  const heading = [item.sequence_number, item.topic].filter(Boolean).join('. ') || `Q&A ${index + 1}`
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
            {heading}
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
          {item.question_text && (
            <Box mb={4}>
              <Text fontSize="xs" fontWeight="700" color="var(--color-dark-gray)" textTransform="uppercase" letterSpacing="wider" mb={2}>
                Question
              </Text>
              <Text fontSize="sm" color="var(--color-black)" lineHeight="1.6" whiteSpace="pre-wrap">
                {item.question_text}
              </Text>
            </Box>
          )}
          {item.answer_text != null && String(item.answer_text).trim() !== '' && (
            <Box mb={4}>
              <Text fontSize="xs" fontWeight="700" color="var(--color-dark-gray)" textTransform="uppercase" letterSpacing="wider" mb={2}>
                Answer
              </Text>
              <Text fontSize="sm" color="var(--color-black)" lineHeight="1.6" whiteSpace="pre-wrap">
                {item.answer_text}
              </Text>
            </Box>
          )}
          <HStack wrap="wrap" gap={{ base: 3, md: 6 }} fontSize="sm" color="var(--color-dark-gray)">
            <HStack gap={1.5}>
              <Text fontWeight="600">Date:</Text>
              <Text>{formatQaDate(item.release_date)}</Text>
            </HStack>
            {lotLabel && (
              <HStack gap={1.5}>
                <Text fontWeight="600">Plots:</Text>
                <Text>{lotLabel}</Text>
              </HStack>
            )}
            {item.information_notice != null && String(item.information_notice).trim() !== '' && (
              <HStack gap={1.5}>
                <Text fontWeight="600">Note of information:</Text>
                <Text>{item.information_notice}</Text>
              </HStack>
            )}
          </HStack>
        </Box>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}

export default function TenderQAPage() {
  const { tenderId } = useTenderDetail()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openQaIndex, setOpenQaIndex] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedLots, setSelectedLots] = useState([])
  const [selectedNotices, setSelectedNotices] = useState([])
  const [appliedLots, setAppliedLots] = useState([])
  const [appliedNotices, setAppliedNotices] = useState([])

  const fetchQa = useCallback(async () => {
    if (!tenderId || !supabase) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('questions_answers')
        .select('*')
        .eq('tender_id', tenderId)
        .order('sequence_number', { ascending: true })

      if (err) {
        console.error('Q&A fetch error:', err)
        setError(err.message)
        setItems([])
        return
      }
      setItems(data ?? [])
    } catch (err) {
      console.error(err)
      setError(err?.message ?? 'Failed to load Q&A')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [tenderId])

  useEffect(() => {
    fetchQa()
  }, [fetchQa])

  const filterOptions = useMemo(() => {
    const lotSet = new Set()
    const noticeSet = new Set()
    items.forEach((item) => {
      const lotLabel = getLotLabel(item.lots)
      if (lotLabel) lotSet.add(lotLabel)
      if (item.information_notice != null && String(item.information_notice).trim() !== '') {
        noticeSet.add(String(item.information_notice).trim())
      }
    })
    return {
      lots: [...lotSet].sort(),
      notices: [...noticeSet].sort(),
    }
  }, [items])

  const filteredItems = useMemo(() => {
    if (appliedLots.length === 0 && appliedNotices.length === 0) return items
    return items.filter((item) => {
      const lotLabel = getLotLabel(item.lots)
      const notice = item.information_notice != null ? String(item.information_notice).trim() : ''
      const matchLot = appliedLots.length === 0 || (lotLabel && appliedLots.includes(lotLabel))
      const matchNotice = appliedNotices.length === 0 || (notice && appliedNotices.includes(notice))
      return matchLot && matchNotice
    })
  }, [items, appliedLots, appliedNotices])

  const handleApplyFilter = useCallback(() => {
    setAppliedLots(selectedLots)
    setAppliedNotices(selectedNotices)
    setOpenQaIndex(0)
  }, [selectedLots, selectedNotices])

  if (loading) return <Loading message="Loading Q&A..." />
  if (error) {
    return (
      <Box p={4}>
        <Text color="var(--color-dark-gray)">Unable to load Q&A. {error}</Text>
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
          <LuMessageCircleQuestion size={20} />
        </Box>
        <Text fontSize="lg" fontWeight="800" color="var(--color-black)" letterSpacing="-0.02em">
          Questions &amp; Answers
        </Text>
        <Text fontSize="sm" color="var(--color-dark-gray)">
          {filteredItems.length} {filteredItems.length === 1 ? 'question' : 'questions'}
        </Text>
      </HStack>

      {/* Filter */}
      <Box px={5} py={3} borderBottomWidth="1px" borderBottomColor="var(--color-gray)">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setFilterOpen((o) => !o)}
          mb={filterOpen ? 3 : 0}
        >
          <LuFilter size={16} /> Filter
        </Button>
        {filterOpen && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={6} mt={3}>
            <Box>
              <Text fontSize="xs" fontWeight="700" color="var(--color-dark-gray)" textTransform="uppercase" letterSpacing="wider" mb={2}>
                Plots
              </Text>
              <VStack align="stretch" gap={2}>
                {filterOptions.lots.length === 0 ? (
                  <Text fontSize="sm" color="var(--color-dark-gray)">No plots</Text>
                ) : (
                  filterOptions.lots.map((label) => (
                    <Checkbox
                      key={label}
                      checked={selectedLots.includes(label)}
                      onCheckedChange={(e) => setSelectedLots((prev) => (e.checked ? [...prev, label] : prev.filter((l) => l !== label)))}
                      label={label}
                    />
                  ))
                )}
              </VStack>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="700" color="var(--color-dark-gray)" textTransform="uppercase" letterSpacing="wider" mb={2}>
                Published in
              </Text>
              <VStack align="stretch" gap={2}>
                {filterOptions.notices.length === 0 ? (
                  <Text fontSize="sm" color="var(--color-dark-gray)">No notes</Text>
                ) : (
                  filterOptions.notices.map((notice) => (
                    <Checkbox
                      key={notice}
                      checked={selectedNotices.includes(notice)}
                      onCheckedChange={(e) => setSelectedNotices((prev) => (e.checked ? [...prev, notice] : prev.filter((n) => n !== notice)))}
                      label={`Note of information ${notice}`}
                    />
                  ))
                )}
              </VStack>
            </Box>
          </SimpleGrid>
        )}
        {filterOpen && (
          <Button size="sm" colorScheme="orange" mt={4} onClick={handleApplyFilter}>
            <LuCheck size={16} /> Apply
          </Button>
        )}
      </Box>

      {filteredItems.length === 0 ? (
        <Box px={5} py={8} textAlign="center">
          <Text color="var(--color-dark-gray)">
            {items.length === 0 ? 'No Q&A for this tender.' : 'No questions match the selected filters.'}
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" gap={0}>
          {filteredItems.map((item, index) => (
            <QACard
              key={item.id ?? item.sequence_number ?? index}
              item={item}
              index={index}
              open={openQaIndex === index}
              onOpenChange={(e) => setOpenQaIndex(e.open ? index : null)}
            />
          ))}
        </VStack>
      )}
    </Box>
  )
}
