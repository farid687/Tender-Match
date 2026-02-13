'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Box, Text, VStack, HStack, SimpleGrid, Badge } from '@chakra-ui/react'
import { LuArrowUpDown, LuFilter } from 'react-icons/lu'
import { Button } from '@/elements/button'
import { IconButton } from '@/elements/icon-button'
import { InputField } from '@/elements/input'
import { SelectField } from '@/elements/select'
import { Loading } from '@/elements/loading'
import TenderCard from './components/TenderCard'
import {
  BOOLEAN_FILTER_OPTIONS,
  CARDS_PER_PAGE,
} from './variables'

const DEFAULT_FILTERS = {
  tender_status: '',
  contract_nature: '',
  is_european: 'any',
  is_digital_submission_possible: 'any',
  platform: '',
  publication_date_from: '',
  publication_date_to: '',
  estimated_value_min: '',
  estimated_value_max: '',
}

const SORT_OPTIONS = [
  { id: 'publication_datetime', name: 'Publication date' },
  { id: 'closing_date', name: 'Deadline' },
  { id: 'estimated_value_amount', name: 'Estimated value' },
]

export default function TendersPage() {
  const [tenders, setTenders] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState('publication_datetime')
  const [sortOrder, setSortOrder] = useState('desc')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [cpvsList, setCpvsList] = useState([])

  const cpvByCode = useMemo(() => {
    const map = {}
    ;(cpvsList || []).forEach((c) => {
      if (c.cpv_code != null) map[String(c.cpv_code).trim()] = { main_cpv_description: c.main_cpv_description ?? '' }
    })
    return map
  }, [cpvsList])

  const platformOptions = useMemo(() => {
    const platforms = [...new Set(tenders.map((t) => t.platform).filter(Boolean))]
    return platforms.map((id) => ({ id, name: id }))
  }, [tenders])

  const tenderStatusOptions = useMemo(() => {
    const statuses = [...new Set(tenders.map((t) => t.tender_status).filter(Boolean))].sort()
    return statuses.map((id) => ({ id, name: id.charAt(0).toUpperCase() + id.slice(1) }))
  }, [tenders])

  const contractNatureOptions = useMemo(() => {
    const natures = [...new Set(tenders.map((t) => t.contract_nature).filter(Boolean))].sort()
    return natures.map((id) => ({ id, name: id.charAt(0).toUpperCase() + id.slice(1) }))
  }, [tenders])

  const fetchCpvs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cpvs')
        .select('cpv_code, main_cpv_description')
        .order('cpv_code', { ascending: true })
      if (error) {
        console.error('CPVs fetch error:', error)
        setCpvsList([])
        return
      }
      setCpvsList(data ?? [])
    } catch {
      setCpvsList([])
    }
  }, [])

  const fetchTenders = useCallback(async () => {
    if (!supabase) return
   

    setLoading(true)
    try {
      let query = supabase
        .from('tenders')
        .select(
          `
          tender_id,
          title,
          description,
          tender_status,
          language,
          notice_type_code,
          publication_type_code,
          publication_type_label,
          procedure_code,
          procedure_label,
          contract_nature,
          is_european,
          is_digital_submission_possible,
          estimated_value_amount,
          cpv_main,
          nut_label,
          publication_datetime,
          closing_date,
          platform,
          client_name
          `,
          { count: 'exact' }
        )
        .order(sortBy, { ascending: sortOrder === 'asc' })

      if (filters.tender_status)
        query = query.eq('tender_status', filters.tender_status)
  
      if (filters.contract_nature)
        query = query.eq('contract_nature', filters.contract_nature)
  
      if (filters.is_european === 'yes')
        query = query.eq('is_european', true)
  
      if (filters.is_european === 'no')
        query = query.eq('is_european', false)
  
      if (filters.is_digital_submission_possible === 'yes')
        query = query.eq('is_digital_submission_possible', true)
  
      if (filters.is_digital_submission_possible === 'no')
        query = query.eq('is_digital_submission_possible', false)
  
      if (filters.platform)
        query = query.eq('platform', filters.platform)
  
      if (filters.publication_date_from)
        query = query.gte('publication_datetime', filters.publication_date_from)
  
      if (filters.publication_date_to)
        query = query.lte('publication_datetime', filters.publication_date_to)
  
      if (filters.estimated_value_min)
        query = query.gte('estimated_value_amount', Number(filters.estimated_value_min))
  
      if (filters.estimated_value_max)
        query = query.lte('estimated_value_amount', Number(filters.estimated_value_max))
  
      const from = (page - 1) * CARDS_PER_PAGE
      query = query.range(from, from + CARDS_PER_PAGE - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Tenders fetch error:', error)
        setFetchError(error.message)
        setTenders([])
        setTotalCount(0)
        return
      }
  
      setFetchError(null)
      setTenders(data)
      setTotalCount(count ?? 0)

    } catch (err) {
      console.error(err)
      setFetchError(err?.message ?? 'Failed to load tenders')
      setTenders([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [page, filters, sortBy, sortOrder])
  
  

  useEffect(() => {
    fetchCpvs()
  }, [fetchCpvs])

  useEffect(() => {
    fetchTenders()
  }, [fetchTenders])

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }, [])

  const totalPages = Math.max(1, Math.ceil(totalCount / CARDS_PER_PAGE))

  const activeFilterCount = useMemo(
    () => Object.keys(DEFAULT_FILTERS).filter((k) => filters[k] !== DEFAULT_FILTERS[k]).length,
    [filters]
  )
  const hasFilters = activeFilterCount > 0

  const getCpvInfo = useCallback((code) => cpvByCode[String(code).trim()] ?? null, [cpvByCode])

  const cpvMainDisplay = useCallback((row) => {
    const main = row?.cpv_main
    if (main == null || main === '') return '—'
    const info = getCpvInfo(main)
    if (!info?.main_cpv_description) return main
    return `${main} – ${info.main_cpv_description}`
  }, [getCpvInfo])

  const platformItems = useMemo(
    () => [{ id: '', name: 'All' }, ...platformOptions],
    [platformOptions]
  )

  const statusItems = useMemo(
    () => [{ id: '', name: 'All' }, ...tenderStatusOptions],
    [tenderStatusOptions]
  )

  const contractItems = useMemo(
    () => [{ id: '', name: 'All' }, ...contractNatureOptions],
    [contractNatureOptions]
  )

  return (
    <Box
      minH={{ base: '90dvh', lg: '90vh' }}
      bg="var(--color-off-white)"
      py={{ base: 3, md: 4 }}
      px={{ base: 3, md: 4 }}
    >
      <Box w="full" mx="auto">
        {/* Header: count left, Sort / Filters right */}
        <Box
          mb={3}
          py={2.5}
          px={{ base: 3, md: 4 }}
          bg="var(--color-white)"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="var(--color-gray)"
          display="flex"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="space-between"
          gap={3}
        >
          <HStack gap={2}>
            <Text fontWeight="700" fontSize="lg" color="var(--color-black)">
              Tenders: <Text as="span" color="var(--color-primary)">{totalCount}</Text>
            </Text>
          </HStack>
          <HStack gap={2} flexWrap="wrap">
            <SelectField
              label=""
              placeholder="Sort by"
              items={SORT_OPTIONS}
              value={sortBy ? [sortBy] : []}
              onValueChange={(d) => {
                const v = d.value?.[0]
                if (v) setSortBy(v)
              }}
            />
            <HStack gap={1}>
              <IconButton
                aria-label="Sort order"
                size="sm"
                variant="outline"
                onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              >
                <LuArrowUpDown size={16} />
              </IconButton>
              <Button
                size="sm"
                variant={filterOpen ? 'solid' : 'outline'}
                colorPalette="primary"
                onClick={() => setFilterOpen((o) => !o)}
                leftIcon={<LuFilter size={16} />}
              >
                Filters
                {hasFilters && (
                  <Badge ml={1} size="sm" borderRadius="full" px={1.5} bg="white" color="var(--color-primary)">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </HStack>
          </HStack>
        </Box>

        {filterOpen && (
          <Box
            mb={4}
            p={4}
            bg="var(--color-white)"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="var(--color-gray)"
            boxShadow="sm"
          >
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap={3}>
              <SelectField
                label="Status"
                items={statusItems}
                placeholder="All statuses"
                value={filters.tender_status ? [filters.tender_status] : []}
                onValueChange={(d) => updateFilter('tender_status', d.value?.[0] ?? '')}
              />
              <SelectField
                label="Contract nature"
                items={contractItems}
                placeholder="All"
                value={filters.contract_nature ? [filters.contract_nature] : []}
                onValueChange={(d) => updateFilter('contract_nature', d.value?.[0] ?? '')}
              />
              <SelectField
                label="European"
                items={BOOLEAN_FILTER_OPTIONS}
                placeholder="Any"
                value={filters.is_european ? [filters.is_european] : ['any']}
                onValueChange={(d) => updateFilter('is_european', d.value?.[0] ?? 'any')}
              />
              <SelectField
                label="Digital submission"
                items={BOOLEAN_FILTER_OPTIONS}
                placeholder="Any"
                value={filters.is_digital_submission_possible ? [filters.is_digital_submission_possible] : ['any']}
                onValueChange={(d) => updateFilter('is_digital_submission_possible', d.value?.[0] ?? 'any')}
              />
              <SelectField
                label="Platform"
                items={platformItems}
                placeholder="All"
                value={filters.platform ? [filters.platform] : []}
                onValueChange={(d) => updateFilter('platform', d.value?.[0] ?? '')}
              />
              <InputField
                label="Published from"
                type="date"
                value={filters.publication_date_from}
                onChange={(e) => updateFilter('publication_date_from', e.target.value)}
              />
              <InputField
                label="Published to"
                type="date"
                value={filters.publication_date_to}
                onChange={(e) => updateFilter('publication_date_to', e.target.value)}
              />
              <InputField
                label="Value min (€)"
                type="number"
                placeholder="Min"
                value={filters.estimated_value_min}
                onChange={(e) => updateFilter('estimated_value_min', e.target.value)}
              />
              <InputField
                label="Value max (€)"
                type="number"
                placeholder="Max"
                value={filters.estimated_value_max}
                onChange={(e) => updateFilter('estimated_value_max', e.target.value)}
              />
            </SimpleGrid>
            <HStack mt={3} justifyContent="flex-end">
              <Button size="sm" variant="ghost" onClick={clearFilters} colorPalette="gray">
                Clear all
              </Button>
            </HStack>
          </Box>
        )}

        {loading ? (
          <Loading message="Loading tenders..." />
        ) : (
          <VStack align="stretch" gap={2}>
            {tenders.length === 0 ? (
              <Box
                py={8}
                px={4}
                textAlign="center"
                bg="var(--color-white)"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="var(--color-gray)"
              >
                <Text color="var(--color-dark-gray)" fontSize="md">
                  {fetchError
                    ? `Unable to load tenders. ${fetchError}`
                    : 'No tenders match your filters. Try changing them.'}
                </Text>
              </Box>
            ) : (
              tenders.map((t, index) => (
                <TenderCard key={`tender-${index}`} t={t} cpvMainDisplay={cpvMainDisplay} />
              ))
            )}

            {totalPages > 1 && (
              <HStack justify="center" gap={3} mt={4} py={1}>
                <IconButton
                  aria-label="Previous page"
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ←
                </IconButton>
                <Text fontSize="md" color="var(--color-dark-gray)">
                  Page <Text as="span" fontWeight="700" color="var(--color-primary)">{page}</Text> of {totalPages}
                  <Text as="span" color="var(--color-dark-gray)" ml={1}>({totalCount})</Text>
                </Text>
                <IconButton
                  aria-label="Next page"
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  →
                </IconButton>
              </HStack>
            )}
          </VStack>
        )}
      </Box>
    </Box>
  )
}
