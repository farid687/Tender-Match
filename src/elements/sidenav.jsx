'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useGlobal } from '@/context'
import { Box, VStack, HStack, Text } from '@chakra-ui/react'
import { LuUserRound } from 'react-icons/lu'

const navItems = [
  {
    id: 'profile',
    label: 'Profile',
    href: '/app/profile',
    icon: LuUserRound,
  },
]

export function SideNav() {
  const pathname = usePathname()
  const { user } = useGlobal()

  // Don't show sidenav on auth routes, onboarding route, or when user is not authenticated
  if (!user  || pathname === '/app/onboarding') {
    return null
  }

  return (
    <Box
      as="nav"
      position="fixed"
      left="0"
      top="0"
      h="100vh"
      w="280px"
      bg="white"
      borderRightWidth="1px"
      borderRightStyle="solid"
      borderRightColor="#efefef"
      zIndex="900"
      display={{ base: 'none', lg: 'block' }}
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.05)"
      overflowY="auto"
      py="6"
      px="5"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)"
      }}
    >
      <VStack align="stretch" h="full" gap="6">
        {/* Logo Section */}
        <Box pb="4" borderBottomWidth="1px" borderBottomStyle="solid" borderBottomColor="#efefef">
          <Link href="/app/profile" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center"
              style={{
                filter: "drop-shadow(0 2px 8px rgba(31, 106, 225, 0.1))"
              }}
            >
              <Box as="img" src="/assets/MTM_Vertical.svg" alt="Logo" w="160px" h="70px" />
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
                  px="4"
                  py="3.5"
                  borderRadius="xl"
                  position="relative"
                  textAlign="left"
                  fontWeight={isActive ? '600' : '500'}
                  cursor="pointer"
                  transition="all 0.3s ease"
                  style={{
                    background: isActive 
                      ? "linear-gradient(135deg, rgba(31, 106, 225, 0.1) 0%, rgba(107, 78, 255, 0.08) 100%)"
                      : "transparent",
                    color: isActive ? "#1f6ae1" : "#666",
                    boxShadow: isActive ? "0 2px 8px rgba(31, 106, 225, 0.15)" : "none"
                  }}
                  _hover={{
                    background: isActive 
                      ? "linear-gradient(135deg, rgba(31, 106, 225, 0.15) 0%, rgba(107, 78, 255, 0.12) 100%)"
                      : "rgba(31, 106, 225, 0.05)",
                    color: isActive ? "#1f6ae1" : "#1c1c1c",
                    transform: "translateX(4px)",
                    boxShadow: isActive ? "0 4px 12px rgba(31, 106, 225, 0.2)" : "0 2px 8px rgba(0, 0, 0, 0.05)"
                  }}
                  _active={{
                    transform: "translateX(2px)"
                  }}
                >
                  <HStack gap="3" align="center">
                    <Box
                      as={Icon}
                      size="20px"
                      style={{
                        color: isActive ? "#1f6ae1" : "#666",
                        transition: "all 0.3s ease"
                      }}
                    />
                    <Text fontSize="sm" letterSpacing="0.01em" fontWeight="inherit">
                      {item.label}
                    </Text>
                  </HStack>
                  {isActive && (
                    <Box
                      position="absolute"
                      left="0"
                      top="50%"
                      transform="translateY(-50%)"
                      w="4px"
                      h="60%"
                      borderRadius="0 4px 4px 0"
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
      </VStack>
    </Box>
  )
}
