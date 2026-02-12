'use client'

import { Box, Text, Heading, VStack, ProgressCircle, AbsoluteCenter } from '@chakra-ui/react'

export default function ProfileDetailHeader({ progressPercentage }) {
  return (
    <Box
      mb={{ base: "6", md: "8" }}
      p={{ base: "5", md: "6" }}
      borderRadius="2xl"
      bg="#fafafa"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="#efefef"
      boxShadow="0 1px 3px rgba(0,0,0,0.04)"
    >
      <VStack gap={{ base: "5", md: "6" }} align="stretch">
        <Box display="flex" flexDirection={{ base: "column", sm: "row" }} alignItems="center" justifyContent="space-between" gap="4">
          <Box flex="1" textAlign={{ base: "center", sm: "left" }}>
            <Heading
              size={{ base: "lg", md: "xl" }}
              fontWeight="700"
              letterSpacing="-0.02em"
              style={{
                background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Profile
            </Heading>
            <Text fontSize={{ base: "sm", md: "md" }} color="#666" mt="1" fontWeight="500">
              Manage your company information and showcase your portfolio
            </Text>
          </Box>
          <Box flexShrink={0}>
            <ProgressCircle.Root size="xl" value={progressPercentage}>
              <ProgressCircle.Circle>
                <ProgressCircle.Track />
                <ProgressCircle.Range stroke="green" />
              </ProgressCircle.Circle>
              <AbsoluteCenter>
                <ProgressCircle.ValueText />
              </AbsoluteCenter>
            </ProgressCircle.Root>
          </Box>
        </Box>
      </VStack>
    </Box>
  )
}
