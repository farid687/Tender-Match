'use client'

import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { GlobalProvider } from '@/context/index'

export function Provider(props) {
  return (
    <ChakraProvider value={defaultSystem}>
      <GlobalProvider>
        {props.children}
      </GlobalProvider>
    </ChakraProvider>
  )
}
