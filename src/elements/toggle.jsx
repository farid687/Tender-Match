'use client'

import { Switch } from '@chakra-ui/react'
import { Box, Text } from '@chakra-ui/react'
import * as React from 'react'

export const Toggle = React.forwardRef(function Toggle(props, ref) {
  const {
    label,
    checked = false,
    onCheckedChange,
    helperText,
    disabled,
    variant,
    ...rest
  } = props

  const handleChange = (e) => {
    onCheckedChange?.({ checked: e.checked })
  }

  return (
    <Box>
      <Switch.Root
        ref={ref}
        checked={checked}
        onCheckedChange={handleChange}
        disabled={disabled}
        variant={variant}
        colorPalette="blue"
        {...rest}
      >
        <Switch.HiddenInput />
        <Switch.Control
          style={checked ? { backgroundColor: '#1f6ae1' } : undefined}
        >
          <Switch.Thumb />
        </Switch.Control>
        {label && (
          <Switch.Label>
            {label}
          </Switch.Label>
        )}
      </Switch.Root>
      {helperText && (
        <Text fontSize="xs" color="gray.500" mt="1" ml="10">
          {helperText}
        </Text>
      )}
    </Box>
  )
})
