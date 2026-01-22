'use client'

import { Menu as ChakraMenu, Box, HStack, Text } from '@chakra-ui/react'
import Link from 'next/link'
import * as React from 'react'

export const Menu = React.forwardRef(function Menu(props, ref) {
  const {
    trigger,
    items = [],
    positioning,
    onSelect,
    ...rest
  } = props

  const handleItemClick = React.useCallback((item) => {
    if (item.onClick) {
      item.onClick()
    }
    if (onSelect) {
      onSelect(item)
    }
  }, [onSelect])

  return (
    <ChakraMenu.Root ref={ref} {...rest}>
      <ChakraMenu.Trigger asChild>
        {trigger}
      </ChakraMenu.Trigger>
      <ChakraMenu.Positioner {...(positioning && { positioning })}>
        <ChakraMenu.Content>
          <ChakraMenu.ItemGroup>
            {items.map((item, index) => {
              if (item.type === 'separator') {
                return <ChakraMenu.Separator key={`separator-${index}`} />
              }

              const content = item.children || (item.label ? <Text>{item.label}</Text> : null)
              
              const menuItemContent = item.icon ? (
                <HStack gap={2}>
                  {item.icon}
                  {content}
                </HStack>
              ) : (
                content
              )
              
              // If item has href, wrap in Link
              if (item.href) {
                return (
                  <ChakraMenu.Item
                    key={item.id || item.key || index}
                    asChild
                    disabled={item.disabled}
                    className={item.className}
                    color={item.color}
                    _hover={item.color ? { bg: 'gray.100', color: item.color } : undefined}
                  >
                    <Link href={item.href}>
                      {menuItemContent}
                    </Link>
                  </ChakraMenu.Item>
                )
              }
              
              return (
                <ChakraMenu.Item
                  key={item.id || item.key || index}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={item.className}
                  color={item.color}
                  _hover={item.color ? { bg: 'gray.100', color: item.color } : undefined}
                >
                  {menuItemContent}
                </ChakraMenu.Item>
              )
            })}
          </ChakraMenu.ItemGroup>
        </ChakraMenu.Content>
      </ChakraMenu.Positioner>
    </ChakraMenu.Root>
  )
})
