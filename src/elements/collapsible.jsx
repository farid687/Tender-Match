'use client'

import { forwardRef, useCallback, useState } from 'react'
import { IoMdArrowDropup, IoMdArrowDropdown } from 'react-icons/io'

export const Collapsible = forwardRef(function Collapsible(props, ref) {
  const {
    children,
    title,
    icon,
    defaultOpen = false,
    open,
    onOpenChange,
    disabled = false,
    className = '',
    headerClassName = '',
    contentClassName = '',
    ...rest
  } = props

  // Controlled vs uncontrolled state
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleToggle = useCallback(() => {
    if (disabled) return
    const newOpen = !isOpen
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [isOpen, isControlled, disabled, onOpenChange])

  return (
    <div
      ref={ref}
      className={`rounded-md overflow-hidden  !p-3 ${className}`}
      {...rest}
    >
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex  items-center justify-between 
          hover:bg-gray-50 transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${headerClassName}
        `}
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        <div className="flex items-center gap-3 flex-1">
          {icon && (
            <span className="text-dark-gray flex-shrink-0">
              {icon}
            </span>
          )}
          {title && (
            <span className="text-left !font-semibold text-black">
              {title}
            </span>
          )}
        </div>
        <span className=" flex-shrink-0 transition-transform duration-200">
          {isOpen ? <IoMdArrowDropup className="!text-secondary" size={24} />  : <IoMdArrowDropdown className="!text-secondary"  size={24} />}
        </span>
      </button>
      
      {isOpen && (
        <div
          className={`
            border-t border-gray p-4
            animate-in fade-in slide-in-from-top-2 duration-200
            ${contentClassName}
          `}
        >
          {children}
        </div>
      )}
    </div>
  )
})
