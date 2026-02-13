'use client'

import { Box, Text, Heading, VStack, HStack, ProgressCircle, AbsoluteCenter } from '@chakra-ui/react'
import { getProgressColor } from '../variables'

export default function ProfileDetailHeader({ progressPercentage }) {
  const { stroke, label: progressLabel } = getProgressColor(progressPercentage ?? 0)

  return (
    <Box
      mb={{ base: "6", md: "4" }}
      bg="var(--color-white)"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="var(--color-gray)"
      boxShadow="0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(var(--color-primary-rgb), 0.06)"
      overflow="hidden"
    >
      <Box
        h="3px"
        bg="linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)"
      />
      <HStack
        align={{ base: "stretch", sm: "center" }}
        justify="space-between"
        gap={{ base: "5", md: "6" }}
        flexDirection={{ base: "column", sm: "row" }}
        px={{ base: "5", md: "6" }}
        py={{ base: "5", md: "6" }}
      >
        <VStack align={{ base: "center", sm: "stretch" }} gap="1" flex="1" minW={0} textAlign={{ base: "center", sm: "left" }}>
          <Heading
            size={{ base: "lg", md: "xl" }}
            fontWeight="700"
            letterSpacing="-0.02em"
            color="var(--color-black)"
          >
            Profile
          </Heading>
          <Text fontSize={{ base: "sm", md: "md" }} color="var(--color-dark-gray)" fontWeight="500">
            Manage your company information and showcase your portfolio
          </Text>
        </VStack>
        <VStack flexShrink={0} gap="1" align="center">
          <ProgressCircle.Root size="xl" value={progressPercentage} min={0} max={100} formatOptions={{ style: 'percent' }}>
            <ProgressCircle.Circle>
              <ProgressCircle.Track />
              <ProgressCircle.Range stroke={stroke} />
            </ProgressCircle.Circle>
            <AbsoluteCenter>
              <ProgressCircle.ValueText />
            </AbsoluteCenter>
          </ProgressCircle.Root>
          <Text fontSize="xs" fontWeight="600" color="var(--color-dark-gray)">
            {progressLabel}
          </Text>
        </VStack>
      </HStack>
    </Box>
  )
}
