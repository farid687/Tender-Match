'use client'

import { Spinner, Box, Text, VStack } from '@chakra-ui/react'

export function Loading({ 
  message = 'Loading...', 
  size = 'lg',
  fullScreen = false,
  className = ''
}) {
  const content = (
    <VStack gap="4" align="center" justify="center">
      <Spinner 
        size={size} 
        color="primary" 
        thickness="4px"
        speed="0.65s"
        className="!text-primary"
      />
      {message && (
        <Text fontSize="sm" color="gray.600" className="!text-gray-600">
          {message}
        </Text>
      )}
    </VStack>
  )

  if (fullScreen) {
    return (
      <div className={`min-h-screen !bg-gradient-to-br !from-off-white !to-light-gray flex items-center justify-center ${className}`}>
        <div className="w-full max-w-md mx-auto px-4">
          {content}
        </div>
      </div>
    )
  }

  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      py="8"
      className={className}
    >
      {content}
    </Box>
  )
}

export function LoadingOverlay({ message = 'Loading...', className = '' }) {
  return (
    <div className={`absolute inset-0 !bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl ${className}`}>
      <VStack gap="3" align="center">
        <Spinner 
          size="lg" 
          color="primary" 
          thickness="4px"
          speed="0.65s"
          className="!text-primary"
        />
        {message && (
          <Text fontSize="sm" color="gray.600" className="!text-gray-600 !font-medium">
            {message}
          </Text>
        )}
      </VStack>
    </div>
  )
}
