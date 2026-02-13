'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useGlobal } from '@/context'
import { Box, VStack, HStack, Text } from '@chakra-ui/react'
import { LuUserRound, LuFileText, LuPanelLeft, LuPanelLeftClose } from 'react-icons/lu'

export const SIDENAV_WIDTH_EXPANDED = 280
export const SIDENAV_WIDTH_COLLAPSED = 50 // ✅ reduced from 72
export const SIDENAV_TRANSITION = 'width 0.18s ease, min-width 0.18s ease'

const navItems = [
  {
    id: 'tenders',
    label: 'Tenders',
    href: '/app/tenders',
    icon: LuFileText,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/app/profile',
    icon: LuUserRound,
  },
]

export function SideNav() {
  const pathname = usePathname()
  const { user, sidenavCollapsed, setSidenavCollapsed } = useGlobal()

  // Don't show sidenav on auth routes, onboarding route, or when user is not authenticated
  if (!user || pathname === '/app/onboarding') {
    return null
  }

  const width = sidenavCollapsed ? SIDENAV_WIDTH_COLLAPSED : SIDENAV_WIDTH_EXPANDED

  return (
    <Box
      as="nav"
      position="fixed"
      left="0"
      top="0"
      h="100vh"
      w={`${width}px`}
      minW={`${width}px`}
      bg="white"
      borderRightWidth="1px"
      borderRightStyle="solid"
      borderRightColor="#efefef"
      zIndex="900"
      display={{ base: 'none', lg: 'block' }}
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.05)"
      overflowY="auto"
      overflowX="hidden"
      py="4"
      // px={sidenavCollapsed ? '2' : '0'}
      transition={SIDENAV_TRANSITION}
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)"
      }}
    >
      <VStack align="stretch" h="full" gap="6">
        {/* Logo Section - vertical logo; when collapsed: cut off bottom half, show only M (top) */}
        {/* <Box borderBottomWidth="1px" borderBottomStyle="solid" borderBottomColor="#d8d8d8" pb="4">
          <Link href="/app/profile" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box
              className={`w-[200px] ${sidenavCollapsed ? "logo-img overflow-hidden" : ""}`}
              transition="width 0.18s ease, height 0.18s ease"
              display="flex"
              justifyContent="center"
              alignItems={sidenavCollapsed ? "flex-start" : "center"}
              style={{
                filter: "drop-shadow(0 2px 8px rgba(31, 106, 225, 0.1))"
              }}
            >
              <Box
                as="img"
                src="/assets/MTM_Vertical.svg"
                alt="Logo"
                className={
                  sidenavCollapsed
                    ? "h-16 w-full object-contain object-top"
                    : "h-full w-full object-contain"
                }
                transition="all 0.18s ease"
              />
            </Box>
          </Link>
        </Box> */}
        {/* Logo Section */}
        <Box
          borderBottomWidth="1px"
          borderBottomColor="#d8d8d8"
          pb="4"
        >
          <Link href="/app/profile">
            <Box
              mx="auto"
              w="200px"
              display="flex"
              justifyContent="center"
            >

              <Box
                h={sidenavCollapsed ? '50px' : '50px'}   // 👈 controls how much logo is visible
                overflow="hidden"                         // 👈 actual clipping happens here
                transition="height 0.18s ease"
                display="flex"
                pl={sidenavCollapsed ? "3" : "0"}
                alignItems="center"                  // 👈 top-aligned so only top half shows
              >
                <Box
                  as="img"
                  src="/assets/MTM_Vertical.svg"
                  alt="Logo"
                  h="70px"                               // 👈 full logo height stays constant
                  objectFit="contain"
                  style={{
                    filter: "drop-shadow(0 2px 8px rgba(31, 106, 225, 0.1))"
                  }}
                />
              </Box>
            </Box>
          </Link>
        </Box>


        {/* Navigation Items */}
        <VStack align="stretch" gap="2" flex="1" mt="2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href)

            return (
              <Link key={item.id} href={item.href} style={{ textDecoration: "none" }}>
                <Box
                  as="button"
                  w="full"
                  minH="30px"                         // ✅ consistent hit-area
                  px={sidenavCollapsed ? 0 : 4}       // ✅ NO horizontal padding when collapsed
                  py={sidenavCollapsed ? "2" : "3"}
                 
                  position="relative"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="left"
                  fontWeight={isActive ? '600' : '500'}
                  cursor="pointer"
                  transition="all 0.18s ease"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, rgba(31, 106, 225, 0.12) 0%, rgba(107, 78, 255, 0.1) 100%)"
                      : "transparent",
                    color: isActive ? "#1f6ae1" : "#666",
                  }}
                >
                  <HStack
                    w="full"
                    justifyContent={sidenavCollapsed ? "center" : "start"}
                    alignItems={"center"} 
                    gap={sidenavCollapsed ? 0 : 3}
                    overflow="hidden"
                  >
                    <Box
                      as={Icon}
                      size="17px"
                      flexShrink={0}
                      style={{
                        color: isActive ? "#1f6ae1" : "#666",
                        transition: "color 0.18s ease"
                      }}
                    />
                    <Text
                      fontSize="sm"
                      letterSpacing="0.01em"
                      fontWeight="inherit"
                      whiteSpace="nowrap"
                      opacity={sidenavCollapsed ? 0 : 1}
                      maxW={sidenavCollapsed ? 0 : '100%'}
                      overflow="hidden"
                      transition="opacity 0.15s ease, max-width 0.18s ease"
                    >
                      {item.label}
                    </Text>
                  </HStack>
                  {isActive && (
                    <Box
                      position="absolute"
                      left="0"
                      top="50%"
                      transform="translateY(-50%)"
                      w={sidenavCollapsed ? "3px" :  "5px"}
                      h="full"
                      style={{
                        background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                        boxShadow: "0 2px 8px rgba(31, 106, 225, 0.4)"
                      }}
                    />
                  )}
                </Box>
              </Link>
            )
          })}
        </VStack>

        {/* Collapse toggle */}
        <Box borderTopWidth="1px" borderTopStyle="solid" borderTopColor="#d8d8d8" w="full">
          <Box
            as="button"
            w="full"
            px={sidenavCollapsed ? 3 : 4}
            py="3"
            display="flex"
            alignItems="center"
            justifyContent={sidenavCollapsed ? "center" : "flex-start"}
            cursor="pointer"
            bg="transparent"
            border="none"
            color="#666"
            transition="all 0.18s ease, background 0.15s ease"
            _hover={{ bg: "rgba(31, 106, 225, 0.06)", color: "#1f6ae1" }}
            onClick={() => setSidenavCollapsed((c) => !c)}
            aria-label={sidenavCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Box
              as={sidenavCollapsed ? LuPanelLeft : LuPanelLeftClose}
              size={22}
              flexShrink={0}
            />
            {!sidenavCollapsed && (
              <Text fontSize="sm" fontWeight="500" ml={3} whiteSpace="nowrap">
                Collapse
              </Text>
            )}
          </Box>
        </Box>
      </VStack>
    </Box>
  )
}
