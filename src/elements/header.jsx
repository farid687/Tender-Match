'use client'


import { usePathname } from 'next/navigation'
import { useGlobal } from '@/context'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toaster } from '@/elements/toaster'
import { Avatar } from '@/elements/avatar'
import { Menu } from '@/elements/menu'
import Uploader from '@/elements/uploader'

import { Box, HStack, VStack, Text, Heading } from '@chakra-ui/react'
import { LuPanelLeft, LuPanelLeftClose, LuUserRound, LuLogOut, LuChevronDown } from 'react-icons/lu'

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
  const { user, sidenavCollapsed, setSidenavCollapsed } = useGlobal()
  const { signOut } = useAuth()
  const pathname = usePathname()

  // Don't show header on auth routes, onboarding route, or when user is not authenticated
  if (!user || pathname?.startsWith('/auth') || pathname === '/app/onboarding') {
    return null
  }

  const pageName = getPageName(pathname)
  const userName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.first_name || user?.last_name || 'User'
  const companyName = user?.company_name || ''
  const userEmail = user?.email || ''
  const profileImg = user?.profile_img || ''

  const handleProfileImgChange = async (url) => {
    if (!supabase) return
    try {
      const { error } = await supabase.auth.updateUser({ data: { profile_img: url || null } })
      if (error) throw error
      toaster.create({ title: url ? 'Profile picture updated' : 'Profile picture removed', type: 'success' })
    } catch (e) {
      console.error('Failed to update profile image:', e)
      toaster.create({ title: 'Failed to save profile picture', type: 'error' })
    }
  }

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
            {/* User menu - shown on mobile when sidenav is hidden */}
            <Box display={{ base: 'block', lg: 'none' }}>
              <Menu
                trigger={
                  <Box
                    as="button"
                    display="flex"
                    alignItems="center"
                    gap={2}
                    px={2}
                    py={1}
                    borderRadius="full"
                    cursor="pointer"
                    className="header-user-pill"
                    style={{
                      background: "rgba(255, 255, 255, 0.65)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(255, 255, 255, 0.7)",
                      boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.9) inset, 0 2px 8px -2px rgba(0, 0, 0, 0.06)"
                    }}
                    aria-label="User menu"
                  >
                    <Avatar
                      name={userName}
                      src={user?.profile_img || user?.avatar_url || user?.profile_image_url}
                      size="sm"
                      className="!bg-primary !text-white"
                    />
                    <Box as={LuChevronDown} size={18} color="gray.500" />
                  </Box>
                }
                items={[
                  {
                    id: 'user-name',
                    children: (
                      <Box px="3" py="1" w="full" borderRadius="lg">
                        <Text fontSize="sm" fontWeight="700" className="!text-black">{userName}</Text>
                        {userEmail && <Text fontSize="xs" className="!text-dark-gray" mt="1">{userEmail}</Text>}
                      </Box>
                    )
                  },
                  { type: 'separator' },
                  {
                    id: 'profile-picture',
                    children: (
                      <Box px="3" py="2" onClick={(e) => e.stopPropagation()}>
                        <Uploader label="Profile picture" entityId={user?.sub} baseName="profile" value={profileImg} onChange={handleProfileImgChange} accept="image/png,image/jpeg,image/webp" />
                      </Box>
                    )
                  },
                  { type: 'separator' },
                  { id: 'profile', label: 'Profile', icon: <Box as={LuUserRound} style={{ color: "#1f6ae1" }} />, href: '/app/profile', color: '#1f6ae1' },
                  { type: 'separator' },
                  { id: 'sign-out', label: 'Sign Out', icon: <Box as={LuLogOut} style={{ color: "#ef4444" }} />, onClick: signOut, color: '#ef4444' }
                ]}
              />
            </Box>
            {/* Collapse toggle - shown when sidenav is visible (lg+) */}
            <Box
              as="button"
              display={{ base: 'none', lg: 'flex' }}
              alignItems="center"
              justifyContent="center"
              p="2"
              borderRadius="full"
              cursor="pointer"
              bg="transparent"
              border="none"
              color="#666"
              transition="all 0.18s ease"
              _hover={{ bg: "rgba(31, 106, 225, 0.08)", color: "#1f6ae1" }}
              onClick={() => setSidenavCollapsed((c) => !c)}
              aria-label={sidenavCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Box
                as={sidenavCollapsed ? LuPanelLeft : LuPanelLeftClose}
                size={22}
              />
            </Box>
          </HStack>
        </HStack>
      </Box>
    </Box>
  )
}
