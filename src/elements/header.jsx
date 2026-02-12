'use client'


import { usePathname } from 'next/navigation'
import { useGlobal } from '@/context'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/elements/avatar'
import { Menu } from '@/elements/menu'

import { Box, HStack, VStack, Text, Heading } from '@chakra-ui/react'
import { LuLogOut, LuUserRound, LuChevronDown } from 'react-icons/lu'

// Function to get page name from pathname
function getPageName(pathname) {
  if (!pathname) return 'Dashboard'
  
  // Remove leading slash and split by '/'
  const parts = pathname.split('/').filter(Boolean)
  
  // Get the last meaningful part
  const lastPart = parts[parts.length - 1]
  
  // Convert to readable format
  if (lastPart === 'profile') return 'Profile'
  if (lastPart === 'tenders') return 'Tenders'
  if (parts.includes('tenders') && parts.length > 1) return 'Tender detail'
  if (lastPart === 'onboarding') return 'Onboarding'
  if (parts.length === 0 || pathname === '/') return 'Dashboard'
  
  // Capitalize first letter and replace hyphens with spaces
  return lastPart
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function Header() {
  const { user } = useGlobal()
  const { signOut } = useAuth()
  const pathname = usePathname()

  // Don't show header on auth routes, onboarding route, or when user is not authenticated
  if (!user || pathname?.startsWith('/auth') || pathname === '/app/onboarding') {
    return null
  }

  const userName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user?.first_name || user?.last_name || 'User'
  const companyName = user?.company_name || ''
  const userEmail = user?.email || ''
  const pageName = getPageName(pathname)

  return (
    <Box
      as="header"
      w="100%"
      position="sticky"
      top="0"
      zIndex="1000"
      py={{ base: "4", md: "5" }}
      px={{ sm: 3, md: 5, lg: 0 }}
      className="header-glass"
      style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.52) 50%, rgba(248, 250, 252, 0.58) 100%)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.9) inset, 0 8px 32px -8px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)"
      }}
    >
      <Box w="full" mx="auto" px={{ base: 3, md: 5 }}>
        <HStack justify="space-between" align="center" gap={{ base: 2, md: 4 }} flexWrap="nowrap">
          <HStack gap={3} minW={0} flex={1} align="center">
            <Box
              w="3px"
              h={{ base: "7", md: "9" }}
              borderRadius="full"
              flexShrink={0}
              opacity={0.9}
              style={{
                background: "linear-gradient(180deg, rgba(31, 106, 225, 0.95) 0%, rgba(107, 78, 255, 0.9) 100%)",
                boxShadow: "0 0 12px rgba(31, 106, 225, 0.25)"
              }}
            />
            <Heading
              as="h1"
              size={{ base: "lg", sm: "xl", md: "2xl" }}
              fontWeight="600"
              noOfLines={1}
              minW={0}
              color="black"
              letterSpacing="-0.025em"
              lineHeight="1.25"
              style={{
                textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)"
              }}
            >
              {pageName}
            </Heading>
          </HStack>

          <HStack gap={{ base: 2, md: 4 }} flexShrink={0}>
            {/* User Menu: glass pill */}
            <Menu
              trigger={
                <Box
                  as="button"
                  aria-label="User menu"
                  className="header-user-pill"
                  display="flex"
                  alignItems="center"
                  gap={3}
                  px={{ base: 1.5, md: 3 }}
                  py={0.5}
                  borderRadius="full"
                  cursor="pointer"
                  outline="none"
                  transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                  style={{
                    background: "rgba(255, 255, 255, 0.65)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.7)",
                    boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.9) inset, 0 2px 8px -2px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)"
                  }}
                  _hover={{
                    background: "rgba(255, 255, 255, 0.88)",
                    boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.95) inset, 0 4px 16px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)"
                  }}
                  _active={{ transform: "scale(0.98)" }}
                  _focusVisible={{
                    outline: "none",
                    boxShadow: "0 0 0 3px rgba(31, 106, 225, 0.2)"
                  }}
                >
                  <Box
                    flexShrink={0}
                    borderRadius="full"
                    overflow="hidden"
                    style={{
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)"
                    }}
                  >
                    <Avatar
                      name={userName}
                      src={user?.avatar_url || user?.profile_image_url}
                      size="sm"
                      className="!bg-primary !text-white"
                      style={{
                        border: "2px solid rgba(255, 255, 255, 0.9)"
                      }}
                    />
                  </Box>
                  <VStack align="start" gap={0} flex={1} minW={0} display="flex">
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.800"
                      noOfLines={1}
                      textAlign="left"
                     
                      maxW={{ base: "100px", sm: "160px", md: "200px" }}
                    >
                      {userName}
                    </Text>
                    {companyName && (
                      <Text
                        fontSize="xs"
                        fontWeight="500"
                        color="var(--color-dark-gray)"
                        noOfLines={1}
                        textAlign="left"
                        maxW={{ base: "100px", sm: "160px", md: "200px" }}
                      >
                        {companyName}
                      </Text>
                    )}
                  </VStack>
                  <Box
                    as={LuChevronDown}
                    flexShrink={0}
                    size={18}
                    color="gray.500"
                    display={{ base: "none", sm: "block" }}
                  />
                </Box>
              }
              items={[
                {
                  id: 'user-name',
                  
                  children: (
                    <Box px="3" py="1" w="full"  borderRadius="lg" >
                      <Text fontSize="sm" fontWeight="700"  className='!text-black'>{userName}</Text>
                      
                      {userEmail && (
                        <Text fontSize="xs" className='!text-dark-gray' mt="1">{userEmail}</Text>
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
