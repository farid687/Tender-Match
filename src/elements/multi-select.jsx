'use client'

import {
  Combobox,
  createListCollection,
  Text,
  Box,
  Portal,
  Wrap,
} from '@chakra-ui/react'
import * as React from 'react'
import { Badge } from './badge'

export const MultiSelectField = React.forwardRef((props, ref) => {
  const {
    items = [],
    placeholder = 'Select...',
    label,
    size = 'md',
    width,
    defaultValue,
    value,
    onValueChange,
    positioning,
    itemToString = (item) => item.name || '',
    itemToValue = (item) => item.id || '',
    disabled,
    required,
    invalid,
    errorText,
    ...rest
  } = props

  const [inputValue, setInputValue] = React.useState('')

  // Filter items based on input value
  const filteredItems = React.useMemo(() => {
    if (!inputValue) return items
    const lowerInput = inputValue.toLowerCase()
    return items.filter((item) => {
      const itemText = itemToString(item).toLowerCase()
      return itemText.includes(lowerInput)
    })
  }, [items, inputValue, itemToString])

  // Create collection with filtered items
  const collection = React.useMemo(
    () =>
      createListCollection({
        items: filteredItems,
        itemToString,
        itemToValue,
      }),
    [filteredItems, itemToString, itemToValue]
  )

  const handleInputChange = React.useCallback((details) => {
    setInputValue(details.inputValue || '')
  }, [])

  // Get selected items from value
  const selectedItems = React.useMemo(() => {
    if (!value || value.length === 0) return []
    return items.filter((item) => value.includes(itemToValue(item)))
  }, [value, items, itemToValue])

  return (
    <Box>
      {label && (
        <Text mb="1" fontWeight="medium" fontSize="sm">
          {label}
          {required && <Text as="span" color="red.500" ml="1">*</Text>}
        </Text>
      )}
      <Combobox.Root
        ref={ref}
        multiple
        closeOnSelect={false}
        collection={collection}
        size={size}
        width={width}
        positioning={positioning}
        value={value || []}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        onInputValueChange={handleInputChange}
        disabled={disabled}
        {...rest}
      >
        <Combobox.Control bg="white" borderColor={invalid ? "red.500" : undefined}>
          <Combobox.Input placeholder={selectedItems.length === 0 ? placeholder : 'Search...'} bg="white" />
          <Combobox.IndicatorGroup>
            <Combobox.ClearTrigger />
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>

        {selectedItems.length > 0 && (
          <Wrap gap="2" mt={"1"}>
            {selectedItems.map((item) => (
              <Badge key={itemToValue(item)}  variant="solid" py={"1"} className="!bg-white !text-black border-mixin shadow-md " style={{ '--border-width': '1px', '--border-color': '#1f6ae1' }}>
                {item?.name || itemToString(item)}
              </Badge>
            ))}
          </Wrap>
        )}

        <Portal>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.ItemGroup>
                {collection?.items?.map((item) => (
                  <Combobox.Item item={item} key={item.id || item.value}>
                    {item?.name || itemToString(item)}
                    <Combobox.ItemIndicator />
                  </Combobox.Item>
                ))}
                <Combobox.Empty>No results found</Combobox.Empty>
              </Combobox.ItemGroup>
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
      {invalid && errorText && (
        <Text fontSize="xs" color="red.500" mt="1">{errorText}</Text>
      )}
    </Box>
  )
})
