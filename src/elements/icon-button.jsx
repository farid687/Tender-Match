'use client'

import { IconButton as ChakraIconButton } from '@chakra-ui/react'
import * as React from 'react'

export const IconButton = React.forwardRef(function IconButton(props, ref) {
  const {
    children,
    'aria-label': ariaLabel,
    variant = 'solid',
    size = 'md',
    colorScheme = 'primary',
    disabled,
    loading,
      onClick,
      type = 'button',
      ...rest
    } = props

  return (
    <ChakraIconButton
      ref={ref}
      variant={variant}
      size={size}
      colorScheme={colorScheme}
      disabled={disabled || loading}
      loading={loading}
      onClick={onClick}
      type={type}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </ChakraIconButton>
  )
})
