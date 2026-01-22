'use client'

import { Checkbox as ChakraCheckbox } from '@chakra-ui/react'
import * as React from 'react'

export const Checkbox = React.forwardRef(function Checkbox(props, ref) {
  const {
    children,
    label,
    ...rest
  } = props

  return (
    <ChakraCheckbox.Root ref={ref} {...rest}>
      <ChakraCheckbox.HiddenInput />
      <ChakraCheckbox.Control>
        <ChakraCheckbox.Indicator>
          <ChakraCheckbox.IndicatorIcon />
        </ChakraCheckbox.Indicator>
      </ChakraCheckbox.Control>
      {(label || children) && (
        <ChakraCheckbox.Label>
          {label || children}
        </ChakraCheckbox.Label>
      )}
    </ChakraCheckbox.Root>
  )
})



