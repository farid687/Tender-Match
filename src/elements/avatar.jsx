'use client'

import { Avatar as ChakraAvatar } from '@chakra-ui/react'
import * as React from 'react'

export const Avatar = React.forwardRef(function Avatar(props, ref) {
  const {
    name,
    src,
    size = 'md',
    colorPalette = 'gray',
    fallback,
    ...rest
  } = props

  return (
    <ChakraAvatar.Root
      ref={ref}
      size={size}
      colorPalette={colorPalette}
      {...rest}
    >
      {src && <ChakraAvatar.Image src={src} alt={name} />}
      <ChakraAvatar.Fallback name={name || fallback || ''} />
    </ChakraAvatar.Root>
  )
})
