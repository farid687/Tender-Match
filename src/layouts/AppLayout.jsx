'use client'

import { Box } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { useGlobal } from '@/context'
import { Header } from "@/elements/header"
import { SideNav, SIDENAV_WIDTH_COLLAPSED, SIDENAV_WIDTH_EXPANDED } from "@/elements/sidenav"

export default function AppLayout({ children }) {
  const pathname = usePathname()
  const { user, sidenavCollapsed } = useGlobal()

  // Determine if sidenav should be shown
  const showSideNav = user && pathname !== '/app/onboarding' && !pathname?.startsWith('/auth')
  const mainMargin = showSideNav
    ? (sidenavCollapsed ? `${SIDENAV_WIDTH_COLLAPSED}px` : `${SIDENAV_WIDTH_EXPANDED}px`)
    : 0

  return (
    <Box minH="100vh" bg="bg.subtle">
      {showSideNav && <SideNav />}
      <Box
        ml={{ base: 0, lg: mainMargin }}
        transition="margin-left 0.18s ease"
      >
        <Header />
        <Box as="main"   >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
