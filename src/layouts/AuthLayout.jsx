'use client'

import { Box } from "@chakra-ui/react";

export default function AuthLayout({ children }) {
  return (
    <Box minH="100vh" bg="bg.subtle">
      {children}
    </Box>
  );
}
