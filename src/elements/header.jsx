'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useGlobal } from '@/context'
import { Avatar } from '@/elements/avatar'
import { Menu } from '@/elements/menu'
import { Button } from '@/elements/button'
import { Box, HStack, Text } from '@chakra-ui/react'
import { LuLogOut, LuUserRound } from 'react-icons/lu'

export function Header() {
  const { user, signOut } = useGlobal()
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
              <Box as="img" src="/assets/MTM_Vertical.svg" alt="Logo" w="180px" h="80px" />
            </Box>
          </Link>
          
          <HStack gap={4}>
            {/* Profile Button */}
            {/* <Link href="/profile">
              <Button
                variant="solid"
                size="md"
                leftIcon={<LuUserRound />}
               className="!bg-secondary"
                color="white"
                _hover={{ bg: 'secondary', opacity: 0.9 }}
              >
                Profile
              </Button>
            </Link> */}
            
            {/* User Menu with Avatar */}
            <Menu
              trigger={
                <Box
                  as="button"
                  cursor="pointer"
                  _hover={{ opacity: 0.8 }}
                  _focus={{ outline: 'none', boxShadow: 'none', border: 'none' }}
                  _active={{ outline: 'none', boxShadow: 'none', border: 'none' }}
                  _focusVisible={{ outline: 'none', boxShadow: 'none', border: 'none' }}
                  transition="opacity 0.2s"
                  aria-label="User menu"
                  border="none !important"
                  outline="none !important"
                  bg="transparent"
                  p={0}
          
                >
                  <Avatar
                    name={userName}
                    size="sm"
                    colorPalette="primary"
                  />
                </Box>
              }
              items={[
                {
                  id: 'user-name',
                  children: (
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold">{userName}</Text>
                      {userEmail && (
                        <Text fontSize="xs" color="gray.500" mt="1">{userEmail}</Text>
                      )}
                    </Box>
                  )
                },
                { type: 'separator' },
                {
                  id: 'profile',
                  label: 'Profile',
                  icon: <Box as={LuUserRound} />,
                  href: '/profile',
                  color: 'black.600'
                },
                { type: 'separator' },
                {
                  id: 'sign-out',
                  label: 'Sign Out',
                  icon: <Box as={LuLogOut} color="red.600" />,
                  onClick: signOut,
                  color: 'red.600'
                }
              ]}
            />
          </HStack>
        </HStack>
      </Box>
    </Box>
  )
}
