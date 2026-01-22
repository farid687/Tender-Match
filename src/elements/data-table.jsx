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
import { LuChevronUp, LuChevronDown, LuChevronLeft, LuChevronRight } from 'react-icons/lu'

const TableRow = React.memo(({ row, index }) => {
  return (
    <tr
      className={`border-mixin ${
        index % 2 === 0 ? '!bg-white' : '!bg-light-gray'
      } hover:bg-gray transition-colors`}
      style={{ '--border-width': '0 0 1px 0', '--border-color': 'rgb(229 231 235)' }}
    >
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} className="!px-3 !py-3 text-sm text-dark-gray">
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
    <div className="flex items-center gap-2">
      <span className="flex-1 text-primary">
        {flexRender(header.column.columnDef.header, header.getContext())}
      </span>
      {header.column.getCanSort() && (
        <div className="flex flex-col gap-0">
          <button
            onClick={handleAscending}
            className={`p-0.5 transition-colors ${
              currentSort === 'asc'
                ? 'text-primary'
                : 'text-dark-gray hover:text-black'
            }`}
            aria-label="Sort ascending"
          >
            <LuChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={handleDescending}
            className={`p-0.5 transition-colors ${
              currentSort === 'desc'
                ? 'text-primary'
                : 'text-dark-gray hover:text-black'
            }`}
            aria-label="Sort descending"
          >
            <LuChevronDown className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
})

export function DataTable({ data = [], columnsData = [], defaultPageSize = 10 }) {
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})

  const columnHelper = useMemo(() => createColumnHelper(), [])

  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="w-4 h-4 text-primary bg-white border-gray rounded focus:ring-2 focus:ring-primary cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 text-primary bg-white border-gray rounded focus:ring-2 focus:ring-primary cursor-pointer"
          />
        ),
      }),
      ...columnsData.map((column) =>
        columnHelper.accessor(column.accessor, {
          id: column.accessor,
          header: () => (
            <span className="text-sm font-semibold text-primary">{column.header}</span>
          ),
          cell: (info) => {
            const value = info.getValue()
            return (
              <span className="text-sm text-dark-gray">
                {value || column.emptyValue || ''}
              </span>
            )
          },
          enableSorting: column.enableSorting !== false,
        })
      ),
    ]

    return baseColumns
  }, [columnsData, columnHelper])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
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
    getRowId: (row) => row.id?.toString() || Math.random().toString(),
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
      <TableRow  key={row.id} row={row} index={index} />
    ))
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="!px-3 !py-3 text-left text-sm !font-semibold text-primary border-mixin"
                    style={{ '--border-width': '0 0 1px 0', '--border-color': 'rgb(229 231 235)' }}
                  >
                    {header.isPlaceholder ? null : (
                      header.id === 'select' ? (
                        flexRender(header.column.columnDef.header, header.getContext())
                      ) : (
                        <SortableHeader header={header} />
                      )
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-4 !p-6">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="p-1.5 rounded border-mixin bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-gray transition-colors"
          style={{ '--border-width': '1px', '--border-color': 'rgb(209 213 219)' }}
          aria-label="Previous page"
        >
          <LuChevronLeft className="w-4 h-4 text-dark-gray" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-dark-gray">
                  ...
                </span>
              )
            }

            return (
              <button
                key={page}
                onClick={() => table.setPageIndex(page - 1)}
                className={`min-w-[36px] h-9 rounded border-mixin transition-colors !font-semibold ${
                  currentPage === page
                    ? '!bg-primary !text-white'
                    : 'bg-white !text-primary hover:bg-light-gray'
                }`}
                style={{ 
                  '--border-width': '1px', 
                  '--border-color': currentPage === page ? 'rgb(37 99 235)' : 'rgb(209 213 219)' 
                }}
              >
                {page}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="p-1.5 rounded border-mixin bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-gray transition-colors"
          style={{ '--border-width': '1px', '--border-color': 'rgb(209 213 219)' }}
          aria-label="Next page"
        >
          <LuChevronRight className="w-4 h-4 text-dark-gray" />
        </button>
      </div>
    </div>
  )
}
