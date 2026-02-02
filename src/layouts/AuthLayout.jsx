'use client'

import { Box } from "@chakra-ui/react";

export default function AuthLayout({ children }) {
  return (
    <Box
      minH={{ base: "100dvh", lg: "100vh" }}
      bg="bg.subtle"
      overflowX="hidden"
      w="100%"
    >
      {children}
    </Box>
  );
}
