'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTenderDetail } from '../context/TenderDetailContext'
import { supabase } from '@/lib/supabase'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleIndicator,
} from '@chakra-ui/react'
import { LuFileText, LuChevronDown, LuDownload } from 'react-icons/lu'
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileZipper } from 'react-icons/fa6'
import { Button } from '@/elements/button'
import { Loading } from '@/elements/loading'
import moment from 'moment'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.tenderned.nl'

/** Document/zip URL: BASE_URL + path (e.g. https://www.tenderned.nl + download_href) */
function fullUrl(path) {
  if (!path || typeof path !== 'string') return null
  const p = String(path).trim()
  const sep = p.startsWith('/') ? '' : '/'
  return `${BASE_URL}${sep}${p}`
}

/** publication_category_code → section title */
export const DOCUMENT_CATEGORIES = {
  ANK: 'Announcements',
  DOC: 'Tender documents',
  NVI: 'Note of information',
}

function formatDocumentDate(dateStr) {
  if (!dateStr) return '—'
  const d = moment(dateStr)
  if (!d.isValid()) return String(dateStr)
  return d.format('MMM D, YYYY')
}

function formatFileSize(value) {
  if (value == null || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  if (num >= 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(0)} MB`
  if (num >= 1024) return `${(num / 1024).toFixed(0)} KB`
  return `${num} B`
}

const DOC_TYPE_ICON = {
  pdf: { Icon: FaFilePdf, color: '#dc2626' },
  docx: { Icon: FaFileWord, color: '#2563eb' },
  doc: { Icon: FaFileWord, color: '#2563eb' },
  xlsx: { Icon: FaFileExcel, color: '#16a34a' },
  xls: { Icon: FaFileExcel, color: '#16a34a' },
  zip: { Icon: FaFileZipper, color: '#ca8a04' },
}

function getDocumentIcon(doc) {
  const code = (doc.document_type_code ?? doc.document_type_description ?? '').toString().toLowerCase().trim()
  const match = DOC_TYPE_ICON[code]
  if (match) return match
  return { Icon: LuFileText, color: 'var(--color-primary)' }
}

function DocumentRow({ doc }) {
  const name = doc.document_name ?? doc.download_title ?? '—'
  const url = fullUrl(doc.download_href)
  const published = formatDocumentDate(doc.publication_date)
  const fileType = doc.document_type_description ?? doc.document_type_code ?? '—'
  const size = formatFileSize(doc.file_size)
  const { Icon, color } = getDocumentIcon(doc)

  return (
    <Box
      py={3}
      borderBottomWidth="1px"
      borderBottomColor="var(--color-gray)"
      _last={{ borderBottomWidth: 0 }}
      _hover={{ bg: 'var(--color-very-light-gray)' }}
      transition="background 0.15s"
      px={3}
      mx={-3}
      borderRadius="md"
    >
      <HStack align="flex-start" gap={3}>
        <Box flexShrink={0} mt={0.5} color={color}>
          <Icon size={18} />
        </Box>
        <VStack align="stretch" gap={0.5} flex={1} minW={0}>
          <Text fontSize="sm" fontWeight="600" color="var(--color-primary)" lineHeight="1.4">
            {name}
          </Text>
          <Text fontSize="xs" color="var(--color-dark-gray)">
            Published on {published} · {fileType} · {size}
          </Text>
        </VStack>
        {url && (
          <Box
            as="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            flexShrink={0}
            p={2}
            borderRadius="md"
            color="var(--color-primary)"
            _hover={{ bg: 'rgba(var(--color-primary-rgb), 0.1)' }}
            transition="background 0.15s"
            aria-label="Download"
          >
            <LuDownload size={20} />
          </Box>
        )}
      </HStack>
    </Box>
  )
}

function DocumentsSection({ title, count, documents, open, onOpenChange }) {
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
          <Text fontSize="md" fontWeight="700" color="var(--color-black)">
            {title} ({count})
          </Text>
          <Box flexShrink={0} color="var(--color-dark-gray)" transition="transform 0.2s" _open={{ transform: 'rotate(180deg)' }}>
            <CollapsibleIndicator>
              <LuChevronDown size={20} />
            </CollapsibleIndicator>
          </Box>
        </HStack>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Box px={5} py={3} bg="var(--color-white)" borderBottomWidth="1px" borderBottomColor="var(--color-gray)">
          {documents.length === 0 ? (
            <Text fontSize="sm" color="var(--color-dark-gray)" py={2}>
              No documents in this category.
            </Text>
          ) : (
            <VStack align="stretch" gap={0}>
              {documents.map((doc, i) => (
                <DocumentRow key={doc.id ?? doc.document_id ?? i} doc={doc} />
              ))}
            </VStack>
          )}
        </Box>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}

export default function TenderDocumentsPage() {
  const { tenderId } = useTenderDetail()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDocuments = useCallback(async () => {
    if (!tenderId || !supabase) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('documents')
        .select('*')
        .eq('tender_id', tenderId)
        .order('publication_date', { ascending: false })

      if (err) {
        console.error('Documents fetch error:', err)
        setError(err.message)
        setDocuments([])
        return
      }
      setDocuments(data ?? [])
    } catch (err) {
      console.error(err)
      setError(err?.message ?? 'Failed to load documents')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [tenderId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const byCategory = useMemo(() => {
    const ank = documents.filter((d) => (d.publication_category_code ?? '').toUpperCase() === 'ANK')
    const doc = documents.filter((d) => (d.publication_category_code ?? '').toUpperCase() === 'DOC')
    const nvi = documents.filter((d) => (d.publication_category_code ?? '').toUpperCase() === 'NVI')
    return { ANK: ank, DOC: doc, NVI: nvi }
  }, [documents])

  const zipDownloadUrl = useMemo(() => {
    const docWithZip = documents.find((d) => d.zip_dowload)
    return docWithZip ? fullUrl(docWithZip.zip_dowload) : null
  }, [documents])

  const [openSectionIndex, setOpenSectionIndex] = useState(0)

  if (loading) return <Loading message="Loading documents..." />
  if (error) {
    return (
      <Box p={4}>
        <Text color="var(--color-dark-gray)">Unable to load documents. {error}</Text>
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
        flexWrap="wrap"
        justify="space-between"
      >
        <HStack gap={3}>
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
            <LuFileText size={20} />
          </Box>
          <Box>
            <Text fontSize="lg" fontWeight="800" color="var(--color-black)" letterSpacing="-0.02em">
              Documents
            </Text>
            <Text fontSize="sm" color="var(--color-dark-gray)">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </Text>
          </Box>
        </HStack>
        {zipDownloadUrl && (
          <Button
            size="sm"
            variant="solid"
            colorScheme="primary"
            as="a"
            href={zipDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            bg="linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)"
            color="var(--color-white)"
            border="none"
           
          >
            <LuDownload size={18} /> Download all documents
          </Button>
        )}
      </HStack>

      {documents.length === 0 ? (
        <Box px={5} py={8} textAlign="center">
          <Text color="var(--color-dark-gray)">No documents linked to this tender.</Text>
        </Box>
      ) : (
        <VStack align="stretch" gap={0}>
          <DocumentsSection
            title="All documents"
            count={documents.length}
            documents={documents}
            open={openSectionIndex === 0}
            onOpenChange={(e) => setOpenSectionIndex(e.open ? 0 : null)}
          />
          <DocumentsSection
            title={DOCUMENT_CATEGORIES.ANK}
            count={byCategory.ANK.length}
            documents={byCategory.ANK}
            open={openSectionIndex === 1}
            onOpenChange={(e) => setOpenSectionIndex(e.open ? 1 : null)}
          />
          <DocumentsSection
            title={DOCUMENT_CATEGORIES.DOC}
            count={byCategory.DOC.length}
            documents={byCategory.DOC}
            open={openSectionIndex === 2}
            onOpenChange={(e) => setOpenSectionIndex(e.open ? 2 : null)}
          />
          <DocumentsSection
            title={DOCUMENT_CATEGORIES.NVI}
            count={byCategory.NVI.length}
            documents={byCategory.NVI}
            open={openSectionIndex === 3}
            onOpenChange={(e) => setOpenSectionIndex(e.open ? 3 : null)}
          />
        </VStack>
      )}
    </Box>
  )
}
