'use client'

import { Badge as ChakraBadge } from '@chakra-ui/react'
import * as React from 'react'

export const Badge = React.forwardRef((props, ref) => {
  const {
    children,
    variant = 'solid',
    colorPalette = 'gray',
    size = 'md',
    ...rest
  } = props

  return (
    <ChakraBadge
      ref={ref}
      variant={variant}
      colorPalette={colorPalette}
      size={size}
      {...rest}
    >
      {children}
    </ChakraBadge>
  )
})
