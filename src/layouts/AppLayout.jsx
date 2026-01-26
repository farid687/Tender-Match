'use client'

import { Box, Flex } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { useGlobal } from '@/context'
import { Header } from "@/elements/header";
import { SideNav } from "@/elements/sidenav";

export default function AppLayout({ children }) {
  const pathname = usePathname()
  const { user } = useGlobal()
  
  // Determine if sidenav should be shown
  const showSideNav = user && pathname !== '/app/onboarding' && !pathname?.startsWith('/auth')
  
  return (
    <Box minH="100vh" bg="bg.subtle">
      {showSideNav && <SideNav />}
      <Box
        ml={showSideNav ? { base: 0, lg: '280px' } : 0}
        transition="margin-left 0.2s"
      >
        <Header />
        <Box as="main"   >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
