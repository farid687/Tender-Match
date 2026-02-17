'use client'

import React, { useState, useMemo, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { Box, Text, HStack } from '@chakra-ui/react'
import { LuChevronUp, LuChevronDown, LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { Badge } from '@chakra-ui/react'
import { Checkbox } from '@/elements/checkbox'
import { IconButton } from '@/elements/icon-button'

const TableRow = React.memo(({ row, index }) => {
  return (
    <tr
      style={{
        borderBottom: '1px solid var(--color-gray)',
        background: index % 2 === 0 ? 'var(--color-white)' : 'var(--color-very-light-gray)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(var(--color-primary-rgb), 0.06)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = index % 2 === 0 ? 'var(--color-white)' : 'var(--color-very-light-gray)'
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          style={{
            padding: '12px 16px',
            fontSize: '0.875rem',
            color: 'var(--color-dark-gray)',
            verticalAlign: 'middle',
          }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  )
})

const SortableHeader = React.memo(({ header }) => {
  const currentSort = header.column.getIsSorted()

  const handleAscending = useCallback(() => {
    if (currentSort === 'asc') {
      header.column.clearSorting()
    } else {
      header.column.toggleSorting(false)
    }
  }, [header, currentSort])

  const handleDescending = useCallback(() => {
    if (currentSort === 'desc') {
      header.column.clearSorting()
    } else {
      header.column.toggleSorting(true)
    }
  }, [header, currentSort])

  return (
    <HStack gap={2} align="center" w="full">
      <Text as="span" flex={1} fontSize="xs" fontWeight="700" color="var(--color-primary)" textTransform="uppercase" letterSpacing="wider">
        {flexRender(header.column.columnDef.header, header.getContext())}
      </Text>
      {header.column.getCanSort() && (
        <HStack gap={0} flexShrink={0}>
          <Box
            as="button"
            type="button"
            p={0.5}
            color={currentSort === 'asc' ? 'var(--color-primary)' : 'var(--color-dark-gray)'}
            _hover={{ color: 'var(--color-black)' }}
            transition="color 0.15s"
            onClick={handleAscending}
            aria-label="Sort ascending"
          >
            <LuChevronUp size={14} />
          </Box>
          <Box
            as="button"
            type="button"
            p={0.5}
            color={currentSort === 'desc' ? 'var(--color-primary)' : 'var(--color-dark-gray)'}
            _hover={{ color: 'var(--color-black)' }}
            transition="color 0.15s"
            onClick={handleDescending}
            aria-label="Sort descending"
          >
            <LuChevronDown size={14} />
          </Box>
        </HStack>
      )}
    </HStack>
  )
})

export function DataTable({
  data = [],
  columnsData = [],
  defaultPageSize = 10,
  showSelectColumn = true,
  getRowId,
}) {
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})

  const columnHelper = useMemo(() => createColumnHelper(), [])

  const columns = useMemo(() => {
    const dataColumns = columnsData.map((column) =>
      columnHelper.accessor(column.accessor, {
        id: column.accessor,
        header: () => (
          <Text as="span" fontSize="xs" fontWeight="700" color="var(--color-primary)" textTransform="uppercase" letterSpacing="wider">
            {column.header ?? column.Header ?? column.accessor}
          </Text>
        ),
        cell: (info) => {
          const value = info.getValue()
          if (typeof column.cell === 'function') {
            return column.cell(info)
          }
          if (column.accessor === 'is_digital_submission_possible') {
            const v = value
            const label = v === true || v === 'true' ? 'Yes' : 'No'
            return (
              <Badge size="sm" colorPalette={v ? 'green' : 'gray'} borderRadius="md" px={2} py={0.5}>
                {label}
              </Badge>
            )
          }
          if (column.accessor === 'closing_date') {
            if (value == null) return '—'
            try {
              const d = new Date(value)
              return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString()
            } catch {
              return String(value)
            }
          }
          if (column.accessor === 'estimated_value_amount') {
            if (value == null || value === '') return '—'
            const num = Number(value)
            if (Number.isNaN(num)) return String(value)
            return new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0,
            }).format(num)
          }
          return (
            <Text as="span" fontSize="sm" color="var(--color-dark-gray)">
              {value ?? column.emptyValue ?? ''}
            </Text>
          )
        },
        enableSorting: column.enableSorting !== false,
      })
    )
    const baseColumns = showSelectColumn
      ? [
          columnHelper.display({
            id: 'select',
            header: ({ table }) => (
              <Checkbox
                checked={table.getIsAllRowsSelected()}
                indeterminate={table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
                onCheckedChange={(e) => {
                  const checked = e.checked === true
                  table.getToggleAllRowsSelectedHandler()({ target: { checked } })
                }}
                aria-label="Select all rows"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(e) => {
                  const checked = e.checked === true
                  row.getToggleSelectedHandler()({ target: { checked } })
                }}
                aria-label="Select row"
              />
            ),
          }),
          ...dataColumns,
        ]
      : dataColumns

    return baseColumns
  }, [columnsData, columnHelper, showSelectColumn])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: !!showSelectColumn,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: defaultPageSize,
      },
    },
    getRowId: getRowId ?? ((row) => row.id?.toString() ?? row.tender_id?.toString() ?? Math.random().toString()),
  })

  const pageCount = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1

  const getPageNumbers = useCallback(() => {
    const pages = []
    const totalPages = pageCount
    const current = currentPage

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (current <= 4) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (current >= totalPages - 3) {
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push('ellipsis')
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }, [pageCount, currentPage])

  const renderTableBody = () => {
    const rows = table.getRowModel().rows
    return rows.map((row, index) => (
      <TableRow key={row.id} row={row} index={index} />
    ))
  }

  return (
    <Box w="full">
      <Box overflowX="auto">
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'var(--color-white)',
          }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} style={{ background: 'var(--color-very-light-gray)', borderBottom: '2px solid var(--color-gray)' }}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '2px solid var(--color-gray)',
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : header.id === 'select'
                        ? flexRender(header.column.columnDef.header, header.getContext())
                        : <SortableHeader header={header} />}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </Box>

      {/* Pagination */}
      <HStack
        justify="center"
        align="center"
        gap={4}
        mt={0}
        py={4}
        px={4}
        borderTopWidth="1px"
        borderTopColor="var(--color-gray)"
        bg="var(--color-very-light-gray)"
        flexWrap="wrap"
      >
        <IconButton
          aria-label="Previous page"
          size="sm"
          variant="outline"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          <LuChevronLeft size={18} />
        </IconButton>

        <HStack gap={1} flexWrap="wrap" justify="center">
          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <Text key={`ellipsis-${index}`} px={2} fontSize="sm" color="var(--color-dark-gray)">
                  …
                </Text>
              )
            }

            const isActive = currentPage === page
            return (
              <Box
                key={page}
                as="button"
                type="button"
                minW="9"
                h="9"
                px={2}
                rounded="lg"
                borderWidth="1px"
                borderColor={isActive ? 'var(--color-primary)' : 'var(--color-gray)'}
                bg={isActive ? 'var(--color-primary)' : 'var(--color-white)'}
                color={isActive ? 'var(--color-white)' : 'var(--color-primary)'}
                fontWeight="700"
                fontSize="sm"
                transition="all 0.15s"
                _hover={
                  isActive
                    ? {}
                    : { bg: 'var(--color-very-light-gray)', borderColor: 'var(--color-primary)' }
                }
                _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
                onClick={() => table.setPageIndex(page - 1)}
              >
                {page}
              </Box>
            )
          })}
        </HStack>

        <IconButton
          aria-label="Next page"
          size="sm"
          variant="outline"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          <LuChevronRight size={18} />
        </IconButton>

        <Text fontSize="sm" color="var(--color-dark-gray)" whiteSpace="nowrap">
          Page <Text as="span" fontWeight="700" color="var(--color-primary)">{currentPage}</Text> of {pageCount || 1}
        </Text>
      </HStack>
    </Box>
  )
}
