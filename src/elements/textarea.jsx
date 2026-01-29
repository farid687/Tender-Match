'use client'

import { Textarea as ChakraTextarea, Box, Text } from '@chakra-ui/react'
import * as React from 'react'

export const TextareaField = React.forwardRef(function TextareaField(props, ref) {
  const {
    label,
    placeholder,
    helperText,
    errorText,
    invalid,
    required,
    disabled,
    resize = 'vertical',
    autoresize = false,
    maxH = '5lh',
    size = 'md',
    variant = 'outline',
    ...rest
  } = props

  return (
    <Box>
      {label && (
        <Text mb="1" fontWeight="medium" fontSize="sm">
          {label}
          {required && <Text as="span" color="red.500" ml="1">*</Text>}
        </Text>
      )}
      <ChakraTextarea
        ref={ref}
        placeholder={placeholder}
        disabled={disabled}
        resize={resize}
        autoresize={autoresize}
        maxH={maxH}
        size={size}
        variant={variant}
        borderColor={invalid ? 'red.500' : undefined}
        className="!bg-white"
        {...rest}
      />
      {helperText && !invalid && (
        <Text fontSize="xs" color="gray.500" mt="1">{helperText}</Text>
      )}
      {invalid && errorText && (
        <Text fontSize="xs" color="red.500" mt="1">{errorText}</Text>
      )}
    </Box>
  )
})
