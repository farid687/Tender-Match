'use client'

import { useTenderDetail } from '../context/TenderDetailContext'
import { Box, Text } from '@chakra-ui/react'

export default function TenderAISummaryPage() {
  const { tender } = useTenderDetail()

  if (!tender?.ai_summary?.trim()) {
    return (
      <Box
        p={3}
        bg="var(--color-white)"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="var(--color-gray)"
        textAlign="center"
      >
        <Text color="var(--color-dark-gray)" fontSize="sm">
          No AI summary available for this tender.
        </Text>
      </Box>
    )
  }

  return (
    <Box
    
      py={5}
      display="flex"
      flexDirection="column"
      bg="linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="rgba(31, 106, 225, 0.12)"
      boxShadow="0 4px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.02)"
      position="relative"
    >
      <Box
        px={8}
        className="ai-summary-prose"
        dangerouslySetInnerHTML={{ __html: tender.ai_summary }}
      />
    </Box>
  )
}
