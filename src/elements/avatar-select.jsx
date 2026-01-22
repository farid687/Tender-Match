'use client'

import {
  Box,
  HStack,
  Select,
  createListCollection,
  useSelectContext,
} from '@chakra-ui/react'
import * as React from 'react'

export const AvatarSelect = React.forwardRef((props, ref) => {
  const {
    items = [],
    placeholder = 'Select...',
    label,
    size = 'md',
    width,
    defaultValue,
    value,
    onValueChange,
    iconSize,
    positioning,
    itemToString = (item) => item.name || '',
    itemToValue = (item) => item.id || '',
    ...rest
  } = props

  const collection = React.useMemo(
    () =>
      createListCollection({
        items,
        itemToString,
        itemToValue,
      }),
    [items, itemToString, itemToValue]
  )

  const SelectValue = () => {
    const select = useSelectContext()
    const items = select.selectedItems || []
    const item = items[0] || {}
    
    if (!items || items.length === 0) {
      return <Select.ValueText placeholder={placeholder} />
    }
    
    return (
      <Select.ValueText placeholder={placeholder}>
        <HStack>
          {item.icon && <Box fontSize={iconSize || '16px'} display="flex" alignItems="center">{item.icon}</Box>}
          {item.name}
        </HStack>
      </Select.ValueText>
    )
  }

  return (
    <Select.Root
      ref={ref}
      collection={collection}
      size={size}
      width={width}
      positioning={positioning}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      {...rest}
    >
      <Select.HiddenSelect />
      {label && <Select.Label>{label}</Select.Label>}
      <Select.Control>
        <Select.Trigger>
          <SelectValue />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Select.Positioner>
        <Select.Content>
          {collection.items.map((item) => (
            <Select.Item item={item} key={item.id} justifyContent="flex-start">
              {item.icon && <Box fontSize={iconSize || '16px'} display="flex" alignItems="center">{item.icon}</Box>}
              {item.name}
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  )
})
