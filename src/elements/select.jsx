'use client'

import {
  Combobox,
  createListCollection,
  Text,
  Box,
  Portal,
} from '@chakra-ui/react'
import * as React from 'react'

export const SelectField = React.forwardRef((props, ref) => {
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

  // Get groupBy function from props
  const { groupBy, ...comboboxProps } = rest

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
        ...(groupBy && { groupBy }),
      }),
    [filteredItems, itemToString, itemToValue, groupBy]
  )

  // Convert value array to single value for Combobox
  const comboboxValue = React.useMemo(() => {
    if (!value || value.length === 0) return []
    return value
  }, [value])

  const handleValueChange = React.useCallback((details) => {
    if (onValueChange) {
      // Combobox returns array, convert to expected format
      onValueChange(details)
    }
  }, [onValueChange])

  const handleInputChange = React.useCallback((details) => {
    setInputValue(details.inputValue || '')
  }, [])



  // In controlled mode (value provided), don't pass defaultValue to avoid conflicts
  const rootProps = {
    ref,
    collection,
    size,
    width,
    positioning,
    onValueChange: handleValueChange,
    onInputValueChange: handleInputChange,
    disabled,
    ...comboboxProps,
  }
  if (comboboxValue != null && comboboxValue.length >= 0) {
    rootProps.value = comboboxValue
  } else if (defaultValue != null) {
    rootProps.defaultValue = defaultValue
  }

  return (
    <Box>
      {label && (
        <Text mb="1" fontWeight="medium" fontSize="sm">
          {label}
          {required && <Text as="span" color="red.500" ml="1">*</Text>}
        </Text>
      )}
      <Combobox.Root {...rootProps}>
        <Combobox.Control bg="white" borderColor={invalid ? "red.500" : undefined}>
          <Combobox.Input placeholder={placeholder} bg="white" />
          <Combobox.IndicatorGroup>
            <Combobox.ClearTrigger />
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        <Portal>
          <Combobox.Positioner>
            <Combobox.Content>
              {groupBy && collection.group ? (
                <>
                  {collection.group().map(([category, groupItems]) => (
                    <Combobox.ItemGroup key={category}>
                      <Combobox.ItemGroupLabel  fontWeight="600" className="!text-black">{category}</Combobox.ItemGroupLabel>
                      {groupItems.map((item, idx) => (
                        <Combobox.Item item={item} key={item.id ?? item.value ?? `group-${category}-${idx}`}>
                          {item?.name || itemToString(item)}
                          <Combobox.ItemIndicator />
                        </Combobox.Item>
                      ))}
                    </Combobox.ItemGroup>
                  ))}
                  <Combobox.Empty>No results found</Combobox.Empty>
                </>
              ) : (
                <Combobox.ItemGroup>
                  {collection.items.map((item, idx) => (
                    <Combobox.Item item={item} key={item.id ?? item.value ?? `item-${idx}`}>
                      {item.name || itemToString(item)}
                      <Combobox.ItemIndicator />
                    </Combobox.Item>
                  ))}
                  <Combobox.Empty>No results found</Combobox.Empty>
                </Combobox.ItemGroup>
              )}
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
