'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useGlobal } from '@/context'
import { Box, Text, VStack, HStack, SimpleGrid, Badge } from '@chakra-ui/react'
import { DataTable } from '@/elements/data-table'
import { LuFilter, LuSearch } from 'react-icons/lu'
import { Button } from '@/elements/button'
import { IconButton } from '@/elements/icon-button'
import { InputField } from '@/elements/input'
import { SelectField } from '@/elements/select'
import { Loading } from '@/elements/loading'
import { toaster } from '@/elements/toaster'
import TenderCard from './components/TenderCard'
import { SearchInput } from '@/elements/search-input'
import { Toggle } from '@/elements/toggle'
import {
  CARDS_PER_PAGE,
  DEFAULT_FILTERS,
  REGION_FILTER_ITEMS,
  TIME_CATEGORIES,
  getTimeBucket,
} from './variables'

const SEARCH_DEBOUNCE_MS = 300

export const TENDER_TABLE_ORDER = [
  'closing_date',
  'client_name',
  'estimated_value_amount',
  'nut_label',
  'is_digital_submission_possible',
]

export default function TendersPage() {
  const { user } = useGlobal()
  const userId = user?.sub ?? null

  const [tenders, setTenders] = useState([])
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState('publication_datetime')
  const [sortOrder, setSortOrder] = useState('desc')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [cpvsList, setCpvsList] = useState([])
  const [timeCategory, setTimeCategory] = useState('all')
  const [searchTitle, setSearchTitle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const searchDebounceRef = useRef(null)
  const [favourites, setFavourites] = useState([])
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [viewMode, setViewMode] = useState('card') // 'card' | 'table'

  // Debounce search so fetch runs after user stops typing
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(searchTitle)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [searchTitle])

  const fetchBookmarks = useCallback(async () => {
    if (!userId) {
      setFavourites([])
      return
    }
    const { data, error } = await supabase
      .from('bookmark')
      .select('tender_id')
      .eq('user_id', userId)
    if (error) {
      console.error('Bookmark fetch error:', error)
      setFavourites([])
      toaster.create({ title: 'Could not load saved tenders', description: error.message, type: 'error' })
      return
    }
    const ids = (data ?? []).map((row) => row.tender_id).filter(Boolean)
    setFavourites(ids)
  }, [userId, supabase])

  const handleToggleBookmark = useCallback(async (tenderId) => {
    if (!userId || !tenderId) return
    setBookmarkLoading(true)
    try {
      const isBookmarked = favourites.includes(tenderId)
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmark')
          .delete()
          .eq('user_id', userId)
          .eq('tender_id', tenderId)
        if (error) {
          console.error('Bookmark remove error:', error)
          toaster.create({ title: 'Could not remove bookmark', description: error.message, type: 'error' })
          return
        }
        setFavourites((prev) => prev.filter((id) => id !== tenderId))
      } else {
        const { error } = await supabase
          .from('bookmark')
          .insert({ user_id: userId, tender_id: tenderId })
        if (error) {
          console.error('Bookmark add error:', error)
          toaster.create({ title: 'Could not save tender', description: error.message, type: 'error' })
          return
        }
        setFavourites((prev) => [...prev, tenderId])
      }
    } finally {
      setBookmarkLoading(false)
    }
  }, [userId, favourites, supabase])

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
    if (!supabase) return
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
  }, [supabase])

  const fetchTenders = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      setFetchError('Unable to connect.')
      return
    }
    setLoading(true)
    setFetchError(null)
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
          client_name,
          tenderned_url
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
  
      // if (filters.is_digital_submission_possible === 'yes')
      //   query = query.eq('is_digital_submission_possible', true)
  
      // if (filters.is_digital_submission_possible === 'no')
      //   query = query.eq('is_digital_submission_possible', false)
  
      if (filters.platform)
        query = query.eq('platform', filters.platform)
  
      if (filters.publication_date_from)
        query = query.gte('publication_datetime', filters.publication_date_from)
  
      if (filters.publication_date_to)
        query = query.lte('publication_datetime', filters.publication_date_to)
  
      if (filters.estimated_value_max)
        query = query.lte('estimated_value_amount', Number(filters.estimated_value_max))

      if (searchQuery?.trim())
        query = query.ilike('title', `%${searchQuery.trim()}%`)

      // No time filter here — time category is applied on frontend from closing_date
      query = query.range(0, 999)

      const { data, error, count } = await query

      if (error) {
        console.error('Tenders fetch error:', error)
        setFetchError(error.message)
        setTenders([])
        return
      }
  
      setFetchError(null)
      setTenders(data ?? [])

    } catch (err) {
      console.error(err)
      setFetchError(err?.message ?? 'Failed to load tenders')
      setTenders([])
    } finally {
      setLoading(false)
    }
  }, [filters, sortBy, sortOrder, searchQuery, supabase])

  // Time buckets and filtering by closing_date — frontend only
  const timeCounts = useMemo(() => {
    const c = { closing_soon: 0, this_month: 0, later: 0 }
    tenders.forEach((t) => {
      const b = getTimeBucket(t.closing_date)
      if (b && c[b] !== undefined) c[b]++
    })
    return c
  }, [tenders])

  const tendersByTime = useMemo(() => {
    if (timeCategory === 'all') return tenders
    return tenders.filter((t) => getTimeBucket(t.closing_date) === timeCategory)
  }, [tenders, timeCategory])

  const totalFiltered = tendersByTime.length
  const displayedTenders = useMemo(
    () => tendersByTime.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE),
    [tendersByTime, page]
  )

  const favouritesSet = useMemo(() => new Set(favourites), [favourites])

  useEffect(() => {
    if (!userId) {
      setFavourites([])
      return
    }
    fetchBookmarks()
  }, [userId, fetchBookmarks])

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

  const totalPages = Math.max(1, Math.ceil(totalFiltered / CARDS_PER_PAGE))

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

  const regionItems = REGION_FILTER_ITEMS

  const tenderTableColumnData = useMemo(() => {
    if (!tendersByTime.length) return []
    const customHeaders = {
      closing_date: 'Deadline',
      client_name: 'Client',
      estimated_value_amount: 'Estimated Value',
      nut_label: 'Province',
      is_digital_submission_possible: 'Digital submission',
    }
    return TENDER_TABLE_ORDER.filter((key) =>
      tendersByTime.some((obj) => Object.prototype.hasOwnProperty.call(obj, key))
    ).map((key) => ({
      accessor: key,
      header: customHeaders[key] ,
    }))
  }, [tendersByTime])

  const tenderTableData = useMemo(
    () => tendersByTime.map((t) => ({ ...t, id: t.tender_id ?? t.id })),
    [tendersByTime]
  )

  return (
    <Box
      minH={{ base: '90dvh', lg: '90vh' }}
      bg="var(--color-off-white)"
      py={{ base: 3, md: 4 }}
      px={{ base: 3, md: 4 }}
    >
      <Box w="full" mx="auto">
        {/* Header: time filter left | search + region + Filters right */}
        <Box
          mb={3}
          py={3}
          px={{ base: 3, md: 4 }}
          bg="var(--color-white)"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="var(--color-gray)"
          display="flex"
          flexWrap="wrap"
          alignItems="center"
          gap={3}
        >
          {/* Left: time category filter — segmented control */}
          <HStack
            gap={0}
            flexWrap="wrap"
            alignItems="center"
            p={0.5}
            borderRadius="lg"
            bg="var(--color-very-light-gray)"
            borderWidth="1px"
            borderColor="var(--color-gray)"
          >
            {TIME_CATEGORIES.map((cat) => (
              <Box
                as="button"
                type="button"
                key={cat.id}
                cursor="pointer"
                display="inline-flex"
                alignItems="center"
                gap={2}
                px={3}
                py={2}
                borderRadius="md"
                bg={timeCategory === cat.id ? 'var(--color-white)' : 'transparent'}
                color={timeCategory === cat.id ? 'var(--color-black)' : 'var(--color-dark-gray)'}
                fontWeight={timeCategory === cat.id ? '600' : '500'}
                boxShadow={timeCategory === cat.id ? 'sm' : 'none'}
                onClick={() => { setTimeCategory(cat.id); setPage(1) }}
                _hover={{ bg: timeCategory === cat.id ? 'var(--color-white)' : 'rgba(0,0,0,0.04)' }}
                transition="background 0.15s, box-shadow 0.15s"
              >
                {cat.id !== 'all' && (
                  <Box
                    w="2"
                    h="2"
                    borderRadius="full"
                    bg={cat.color}
                    flexShrink={0}
                    opacity={timeCategory === cat.id ? 1 : 0.8}
                  />
                )}
                <Text as="span" fontSize="sm">{cat.label}</Text>
                <Text
                  as="span"
                  fontSize="xs"
                  color={timeCategory === cat.id ? 'var(--color-dark-gray)' : 'var(--color-dark-gray)'}
                  opacity={0.9}
                >
                  {cat.id === 'all' ? totalFiltered : (timeCounts[cat.id] ?? 0)}
                </Text>
              </Box>
            ))}
          </HStack>

          <Box flex="1" minW={2} />

          {/* Right: view toggle, search, region, Filters */}
          <HStack gap={2} flexWrap="wrap" alignItems="center">
            {/* <Toggle
              label="Table View"
              checked={viewMode === 'table'}
              onCheckedChange={({ checked }) => setViewMode(checked ? 'table' : 'card')}
            /> */}
            <Box width={{ base: '100%', sm: '320px' }}>
              <SearchInput
                placeholder="Search tenders..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                size="sm"
                showShortcut={false}
                startElement={<Box display="flex" alignItems="center"><LuSearch size={18} style={{ color: 'var(--color-dark-gray)' }} /></Box>}
                startElementProps={{ pr: 4 }}
              />
            </Box>

            <SelectField
              label=""
              size="sm"
              width="160px"
              placeholder="Region"
              items={regionItems}
              value={filters.is_european ? [filters.is_european] : ['any']}
              onValueChange={(d) => updateFilter('is_european', d.value?.[0] ?? 'any')}
              itemToValue={(item) => item.id}
              itemToString={(item) => item.name}
            />

            <Button
              size="sm"
              variant={filterOpen ? 'solid' : 'outline'}
              colorPalette="primary"
              cursor="pointer"
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
          <VStack align="stretch" gap={5}>
            {totalFiltered === 0 ? (
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
                {fetchError && (
                  <Button
                    mt={4}
                    size="sm"
                    variant="solid"
                    colorPalette="primary"
                    onClick={() => fetchTenders()}
                  >
                    Retry
                  </Button>
                )}
              </Box>
            ) : viewMode === 'table' ? (
              <Box bg="var(--color-white)" borderRadius="lg" borderWidth="1px" borderColor="var(--color-gray)" overflow="hidden">
                <DataTable
                  data={tenderTableData}
                  columnsData={tenderTableColumnData}
                  defaultPageSize={CARDS_PER_PAGE}
                  showSelectColumn={false}
                />
              </Box>
            ) : (
              displayedTenders.map((t, index) => (
                <TenderCard
                  key={`tender-${t.tender_id ?? index}`}
                  t={t}
                  cpvMainDisplay={cpvMainDisplay}
                  isBookmarked={t?.tender_id ? favouritesSet.has(t.tender_id) : false}
                  onSaveClick={t?.tender_id ? () => handleToggleBookmark(t.tender_id) : undefined}
                  saveDisabled={bookmarkLoading}
                />
              ))
            )}

            {viewMode === 'card' && totalPages > 1 && (
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
                  <Text as="span" color="var(--color-dark-gray)" ml={1}>({totalFiltered})</Text>
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
