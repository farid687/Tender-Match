'use client'

import { AvatarGroup as ChakraAvatarGroup, Avatar as ChakraAvatar } from '@chakra-ui/react'
import * as React from 'react'

export const AvatarGroup = React.forwardRef(function AvatarGroup(props, ref) {
  const {
    avatars = [],
    gap = '0',
    spaceX = '-3',
    size = 'md',
    overflowCount,
    overflowVariant = 'solid',
    overflowColorPalette,
    ...rest
  } = props

  return (
    <ChakraAvatarGroup
      ref={ref}
      gap={gap}
      spaceX={spaceX}
      size={size}
      {...rest}
    >
      {avatars.map((avatar, idx) => (
        <ChakraAvatar.Root
          key={avatar.id || idx}
          variant={avatar.variant}
          colorPalette={avatar.colorPalette}
          size={avatar.size || size}
        >
          {avatar.src && (
            <ChakraAvatar.Image 
              src={avatar.src} 
              alt={avatar.name || ''} 
            />
          )}
          <ChakraAvatar.Fallback name={avatar.name || avatar.fallback || ''} />
        </ChakraAvatar.Root>
      ))}
      {overflowCount !== undefined && overflowCount > 0 && (
        <ChakraAvatar.Root 
          variant={overflowVariant}
          colorPalette={overflowColorPalette}
          size={size}
        >
          <ChakraAvatar.Fallback>+{overflowCount}</ChakraAvatar.Fallback>
        </ChakraAvatar.Root>
      )}
    </ChakraAvatarGroup>
  )
})
