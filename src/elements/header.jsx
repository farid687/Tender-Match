'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/auth/context/auth-context'
import { Button } from '@/elements/button'
import { Avatar } from '@/elements/avatar'
import { Box, HStack, VStack, Text } from '@chakra-ui/react'
import { LuUser, LuLogOut } from 'react-icons/lu'

export function Header() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  // Don't show header on auth routes, onboarding route, or when user is not authenticated
  if (!user || pathname?.startsWith('/auth') || pathname === '/onboarding') {
    return null
  }

  const userName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user?.first_name || user?.last_name || 'User'
  const userEmail = user?.email || ''

  return (
    <Box
      as="header"
      w="100%"
      borderBottom="1px solid"
      borderColor="gray.200"
      bg="white"
      position="sticky"
      top="0"
      zIndex="1000"
      className="shadow-sm"
    >
      <Box maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
        <HStack justify="space-between" align="center">
          <Link href="/" className="flex items-center">
          <Box  display="flex" justifyContent="center" alignItems="center">
              <Box as="img" src="/assets/MTM_Logos.svg" alt="Logo" w="100px" h="80px" />
            </Box>
          </Link>
          
          <HStack gap={4}>
            {/* User Info with Avatar */}
            <HStack gap={3} className="!pr-4 !border-r !border-gray-200">
              <Avatar
                name={userName}
                size="sm"
                colorPalette="primary"
              />
              <VStack gap={0} align="start" className="hidden md:flex">
                <Text fontSize="sm" fontWeight="semibold" className="!text-gray-900 !font-semibold">
                  {userName}
                </Text>
                <Text fontSize="xs" className="!text-gray-500">
                  {userEmail}
                </Text>
              </VStack>
            </HStack>

            <HStack gap={3}>
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="md"
                  className="!text-gray-700 hover:!bg-gray-100"
                >
                  <LuUser className="!mr-2" />
                  Profile
                </Button>
              </Link>
              
              <Button
                variant="outline"
                size="md"
                onClick={signOut}
                className="!text-gray-700 !border-gray-300 hover:!bg-gray-50"
              >
                <LuLogOut className="!mr-2" />
                Sign Out
              </Button>
            </HStack>
          </HStack>
        </HStack>
      </Box>
    </Box>
  )
}
