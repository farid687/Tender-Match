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
    contentProps,
    ...rest
  } = props

  const handleItemClick = React.useCallback((item) => {
    if (item.onClick) {
      const result = item.onClick()
      if (result && typeof result.catch === 'function') {
        result.catch(() => {})
      }
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
        <ChakraMenu.Content
          borderRadius="xl"
          boxShadow="0 10px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.08)"
          borderWidth="1px"
          borderColor="gray.100"
          py="1"
          minW="220px"
          {...contentProps}
        >
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
