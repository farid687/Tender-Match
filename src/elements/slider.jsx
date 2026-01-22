'use client'

import { Slider, Text, Box, HStack } from '@chakra-ui/react'
import * as React from 'react'
import { LuEqual } from 'react-icons/lu'

export const SliderField = React.forwardRef(function SliderField(props, ref) {
  const {
    label,
    value,
    defaultValue,
    onChange,
    onValueChange,
    required,
    min = 0,
    max = 100,
    step = 1,
    size = 'sm',
    maxW,
    showValue = true,
    formatValue,
    ...rest
  } = props

  const handleValueChange = (details) => {
    const newValue = Array.isArray(details.value) ? details.value[0] : details.value
    onChange?.(newValue)
    onValueChange?.(details)
  }

  const sliderValue = value !== undefined ? [value] : defaultValue
  const currentValue = value !== undefined ? value : (defaultValue ? defaultValue[0] : min)
  const displayValue = formatValue ? formatValue(currentValue) : currentValue

  return (
    <Box ref={ref} {...rest}>
      <Slider.Root
        maxW={maxW}
        size={size}
        value={sliderValue}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
      >
        {label && (
          <HStack justify="space-between" mb="2">
            <Slider.Label>
              {label}
              {required && <Text as="span" color="red.500" ml="1">*</Text>}
            </Slider.Label>
            {showValue && (
              formatValue ? (
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  {displayValue}
                </Text>
              ) : (
                <Slider.ValueText />
              )
            )}
          </HStack>
        )}
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb index={0} boxSize={6} borderColor="tomato">
          <Box color="tomato" as={LuEqual} />
        </Slider.Thumb>
        </Slider.Control>
      </Slider.Root>
    </Box>
  )
})
