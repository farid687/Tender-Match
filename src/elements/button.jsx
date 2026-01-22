import { Button as ChakraButton } from '@chakra-ui/react'
import * as React from 'react'

export const Button = React.forwardRef(function Button(props, ref) {
  const {
    children,
    variant = 'solid',
    size = 'md',
    colorScheme = 'primary',
    disabled,
    loading,
    loadingText,
    onClick,
    type = 'button',
    ...rest
  } = props

  return (
    <ChakraButton
      ref={ref}
      variant={variant}
      size={size}
      colorScheme={colorScheme}
      disabled={disabled || loading}
      loading={loading}
      loadingText={loadingText}
      onClick={onClick}
      type={type}
      {...rest}
    >
      {children}
    </ChakraButton>
  )
})
