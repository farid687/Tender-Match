'use client'

import { Box } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import { useGlobal } from '@/context'
import { Header } from "@/elements/header"
import { SideNav, SIDENAV_WIDTH_COLLAPSED, SIDENAV_WIDTH_EXPANDED } from "@/elements/sidenav"
import { Loading } from '@/elements/loading'
import { useAppBootstrap } from '@/hooks/useAppBootstrap'

export default function AppLayout({ children }) {
  const pathname = usePathname()
  const { user, sidenavCollapsed } = useGlobal()

  const bootstrapping = useAppBootstrap()

  if (bootstrapping) {
    return <Loading fullScreen message="Loading ..." />
  }

  const showSideNav =
    user && pathname !== '/app/onboarding' && !pathname?.startsWith('/auth')

  const mainMargin = showSideNav
    ? (sidenavCollapsed
        ? `${SIDENAV_WIDTH_COLLAPSED}px`
        : `${SIDENAV_WIDTH_EXPANDED}px`)
    : 0

  return (
    <Box minH="100vh" bg="bg.subtle">
      {showSideNav && <SideNav />}

      <Box ml={{ base: 0, lg: mainMargin }} transition="margin-left 0.18s ease">
        <Header />
        <Box as="main">{children}</Box>
      </Box>
    </Box>
  )
}
