'use client'

import { Input, InputGroup, Kbd } from '@chakra-ui/react'
import * as React from 'react'
import { LuSearch } from 'react-icons/lu'

export const SearchInput = React.forwardRef(function SearchInput(props, ref) {
  const {
    placeholder = 'Search...',
    size = 'md',
    variant = 'outline',
    disabled,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    type = 'text',
    startElement,
    startElementProps,
    endElement,
    keyboardShortcut = '⌘K',
    showShortcut = true,
    ...rest
  } = props

  return (
    <InputGroup flex="1" startElement={startElement} startElementProps={startElementProps} endElement={endElement}>
      <Input
        ref={ref}
        type={type}
        placeholder={placeholder}
        variant={variant}
        size={size}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        {...rest}
      />
    </InputGroup>
  )
})
