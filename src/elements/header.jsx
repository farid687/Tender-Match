'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useGlobal } from '@/context'
import { Avatar } from '@/elements/avatar'
import { Menu } from '@/elements/menu'
import { Button } from '@/elements/button'
import { Box, HStack, Text, Heading } from '@chakra-ui/react'
import { LuLogOut, LuUserRound } from 'react-icons/lu'

// Function to get page name from pathname
function getPageName(pathname) {
  if (!pathname) return 'Dashboard'
  
  // Remove leading slash and split by '/'
  const parts = pathname.split('/').filter(Boolean)
  
  // Get the last meaningful part
  const lastPart = parts[parts.length - 1]
  
  // Convert to readable format
  if (lastPart === 'profile') return 'Profile'
  if (lastPart === 'onboarding') return 'Onboarding'
  if (parts.length === 0 || pathname === '/') return 'Dashboard'
  
  // Capitalize first letter and replace hyphens with spaces
  return lastPart
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function Header() {
  const { user, signOut } = useGlobal()
  const pathname = usePathname()

  // Don't show header on auth routes, onboarding route, or when user is not authenticated
  if (!user || pathname?.startsWith('/auth') || pathname === '/app/onboarding') {
    return null
  }

  const userName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user?.first_name || user?.last_name || 'User'
  const userEmail = user?.email || ''
  const pageName = getPageName(pathname)

  return (
    <Box
      as="header"
      w="100%"
      borderBottomWidth="1px"
      borderBottomStyle="solid"
      borderBottomColor="#efefef"
      position="sticky"
      top="0"
      zIndex="1000"
      py={{ base: "4", md: "6" }}
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)"
      }}
    >
      <Box maxW="7xl" mx="auto" px={{ base: 3, sm: 4, md: 6 }}>
        <HStack justify="space-between" align="center" gap={{ base: 2, md: 4 }} flexWrap="nowrap">
          <Heading 
            size={{ base: "lg", sm: "xl", md: "2xl" }}
            fontWeight="700"
            noOfLines={1}
            minW={0}
            style={{
              background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            {pageName} 
          </Heading>
          
          <HStack gap={{ base: 2, md: 4 }} flexShrink={0}>
            {/* User Menu with Avatar */}
            <Menu
              trigger={
                <Box
                  as="button"
                  cursor="pointer"
                  transition="all 0.3s ease"
                  aria-label="User menu"
                  border="none !important"
                  outline="none !important"
                  bg="transparent"
                  p={0}
                  _hover={{
                    transform: "scale(1.05)",
                    opacity: 0.9
                  }}
                  _active={{
                    transform: "scale(0.95)"
                  }}
                  _focus={{
                    outline: 'none',
                    boxShadow: '0 0 0 3px rgba(31, 106, 225, 0.2)',
                    borderRadius: 'full'
                  }}
                >
                  <Box
                    style={{
                      boxShadow: "0 4px 12px rgba(31, 106, 225, 0.2)",
                      borderRadius: "50%",
                      transition: "all 0.3s ease"
                    }}
                    _hover={{
                      boxShadow: "0 6px 16px rgba(31, 106, 225, 0.3)"
                    }}
                  >
                    <Avatar
                      name={userName}
                      size="md"
                      colorPalette="primary"
                    />
                  </Box>
                </Box>
              }
              items={[
                {
                  id: 'user-name',
                  children: (
                    <Box px="2" py="2">
                      <Text fontSize="sm" fontWeight="600" color="#1c1c1c">{userName}</Text>
                      {userEmail && (
                        <Text fontSize="xs" color="#666" mt="1">{userEmail}</Text>
                      )}
                    </Box>
                  )
                },
                { type: 'separator' },
                {
                  id: 'profile',
                  label: 'Profile',
                  icon: <Box as={LuUserRound} style={{ color: "#1f6ae1" }} />,
                  href: '/app/profile',
                  color: '#1f6ae1'
                },
                { type: 'separator' },
                {
                  id: 'sign-out',
                  label: 'Sign Out',
                  icon: <Box as={LuLogOut} style={{ color: "#ef4444" }} />,
                  onClick: signOut,
                  color: '#ef4444'
                }
              ]}
            />
          </HStack>
        </HStack>
      </Box>
    </Box>
  )
}
