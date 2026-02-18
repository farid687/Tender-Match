'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTenderDetail } from '../context/TenderDetailContext'
import { supabase } from '@/lib/supabase'
import {
  Box,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react'
import {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleIndicator,
} from '@chakra-ui/react'
import {
  LuBuilding2,
  LuHash,
  LuMapPin,
  LuMail,
  LuPhone,
  LuGlobe,
  LuUser,
  LuChevronDown,
  LuBadgeCheck,
} from 'react-icons/lu'
import { Loading } from '@/elements/loading'

/** Note: possible values for "Roles of this organization" */
const ROLES_NOTE = [
  'Copper',
  'Organization that provides further information about the tender procedure',
  'Organization that receives requests for participation',
  'Organisation for professional procedures',
  'Organization that provides more information about appeal procedures',
]

function OrgDetailRow({ label, value, icon: Icon, href }) {
  const display = value != null && String(value).trim() !== '' ? String(value).trim() : '—'
  const isPlaceholder = display === '—'
  const isLink = href && display !== '—'
  return (
    <HStack
      align="flex-start"
      py={3.5}
      gap={4}
      borderBottomWidth="1px"
      borderBottomColor="var(--color-gray)"
      _last={{ borderBottomWidth: 0 }}
      transition="background 0.15s"
      _hover={{ bg: 'var(--color-very-light-gray)' }}
      px={3}
      mx={-3}
      borderRadius="md"
    >
      {Icon && (
        <Box
          flexShrink={0}
          w="9"
          h="9"
          borderRadius="lg"
          bg={isPlaceholder ? 'var(--color-very-light-gray)' : 'rgba(var(--color-primary-rgb), 0.1)'}
          color={isPlaceholder ? 'var(--color-dark-gray)' : 'var(--color-primary)'}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={18} />
        </Box>
      )}
      <Box flex={1} minW={0}>
        <Text  fontSize="xs" fontWeight="600" color="var(--color-dark-gray)" mb={1} textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
        {isLink ? (
          <Text
            as="a"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            fontSize="sm"
            color="var(--color-primary)"
            lineHeight="1.5"
            fontWeight={500}
            _hover={{ textDecoration: 'underline' }}
          >
            {display}
          </Text>
        ) : (
          <Text
            fontSize="sm"
            color={isPlaceholder ? 'var(--color-dark-gray)' : 'var(--color-black)'}
            lineHeight="1.5"
            textTransform="capitalize"
            fontWeight={isPlaceholder ? 400 : 500}
          >
            {display}
          </Text>
        )}
      </Box>
    </HStack>
  )
}

function OrganizationCard({ org, index, open, onOpenChange }) {
  const triggerLabel = org.label ? `${index + 1}. ${org.label}` : `Organization ${index + 1}`
  const roles = Array.isArray(org.roles) ? org.roles : (org.roles ? [org.roles] : [])

  return (
    <CollapsibleRoot key={org.id ?? index} open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger
          py={4}
          px={5}
          width="100%"
          textAlign="left"
          bg="var(--color-very-light-gray)"
          borderBottomWidth="1px"
          borderBottomColor="var(--color-gray)"
          _hover={{ bg: 'var(--color-gray)' }}
          transition="background 0.15s, border-color 0.15s"
          _open={{ bg: 'var(--color-white)', borderBottomColor: 'transparent' }}
        >
          <HStack justify="space-between" gap={4}>
            <VStack align="flex-start" gap={0.5}>
              <Text fontSize="xs" fontWeight="700" color="var(--color-primary)" textTransform="uppercase" letterSpacing="wider">
                {triggerLabel}
              </Text>
              <Text fontSize="md" fontWeight="600" color="var(--color-black)">
                {org.name || '—'}
              </Text>
            </VStack>
            <Box
              flexShrink={0}
              color="var(--color-dark-gray)"
              transition="transform 0.2s"
              _open={{ transform: 'rotate(180deg)' }}
            >
              <CollapsibleIndicator>
                <LuChevronDown size={20} />
              </CollapsibleIndicator>
            </Box>
          </HStack>
        </CollapsibleTrigger>
      <CollapsibleContent>
        <Box px={5} py={4} bg="var(--color-white)" borderBottomWidth="1px" borderBottomColor="var(--color-gray)">
          <OrgDetailRow label="Official name" value={org.name} icon={LuBuilding2} />
          <OrgDetailRow label="Registration number" value={org.registration_number} icon={LuHash} />
          <OrgDetailRow label="Postal address" value={org.street} icon={LuMapPin} />
          <OrgDetailRow label="City" value={org.city} icon={LuMapPin} />
          <OrgDetailRow label="Postal code" value={org.postal_code} icon={LuMapPin} />
          <OrgDetailRow label="Land subdivision (NUTS)" value={org.nuts_code} icon={LuMapPin} />
          <OrgDetailRow label="Country" value={org.country} icon={LuGlobe} />
          <OrgDetailRow label="Contact point" value={org.contact_name} icon={LuUser} />
          <OrgDetailRow label="E-mail" value={org.email} icon={LuMail} />
          <OrgDetailRow label="Telephone" value={org.phone} icon={LuPhone} />
          <OrgDetailRow label="Internet address" value={org.website} icon={LuGlobe} href={org.website} />

          <Box mt={4} pt={4} borderTopWidth="1px" borderTopColor="var(--color-gray)">
            <HStack gap={2} mb={3}>
              <LuBadgeCheck size={18} color="var(--color-primary)" />
              <Text fontSize="xs" fontWeight="700" color="var(--color-dark-gray)" textTransform="uppercase" letterSpacing="wider">
                Roles of this organization
              </Text>
            </HStack>
            {roles.length > 0 ? (
              <VStack align="stretch" gap={2}>
                {roles.map((role, i) => (
                  <Text key={i} fontSize="sm" color="var(--color-black)" pl={5}>
                    {typeof role === 'string' ? role : role?.name ?? role?.label ?? '—'}
                  </Text>
                ))}
              </VStack>
            ) : null}
            <Box mt={3} p={3} bg="var(--color-very-light-gray)" borderRadius="md" borderLeftWidth="3px" borderLeftColor="var(--color-primary)">
              <Text fontSize="xs" fontWeight="600" color="var(--color-dark-gray)" mb={2}>
                Note — possible roles:
              </Text>
              <VStack align="stretch" gap={1.5}>
                {ROLES_NOTE.map((label, i) => (
                  <HStack key={i} align="flex-start" gap={2}>
                    <Text fontSize="xs" color="var(--color-primary)" flexShrink={0}>•</Text>
                    <Text fontSize="xs" color="var(--color-dark-gray)" lineHeight="1.4">{label}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </Box>
        </Box>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}

export default function TenderOrganizationsPage() {
  const { tenderId } = useTenderDetail()
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openOrgIndex, setOpenOrgIndex] = useState(0)

  const fetchOrganizations = useCallback(async () => {
    if (!tenderId || !supabase) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('organizations')
        .select('*')
        .eq('tender_id', tenderId)
        .order('label', { ascending: true })

      if (err) {
        console.error('Organizations fetch error:', err)
        setError(err.message)
        setOrganizations([])
        return
      }
      setOrganizations(data ?? [])
    } catch (err) {
      console.error(err)
      setError(err?.message ?? 'Failed to load organizations')
      setOrganizations([])
    } finally {
      setLoading(false)
    }
  }, [tenderId])

  useEffect(() => {
    fetchOrganizations()
  }, [fetchOrganizations])

  if (loading) return <Loading message="Loading organizations..." />
  if (error) {
    return (
      <Box p={4}>
        <Text color="var(--color-dark-gray)">Unable to load organizations. {error}</Text>
      </Box>
    )
  }

  return (
    <Box
      
      bg="var(--color-white)"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="var(--color-gray)"
      boxShadow="0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(var(--color-primary-rgb), 0.06)"
    >
      <HStack
        px={5}
        py={4}
        bg="var(--color-very-light-gray)"
        borderBottomWidth="1px"
        borderBottomColor="var(--color-gray)"
        gap={3}
      >
        <Box
          w="10"
          h="10"
          borderRadius="xl"
          bg="linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)"
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="0 2px 8px rgba(var(--color-primary-rgb), 0.25)"
        >
          <LuBuilding2 size={20} />
        </Box>
        <Text fontSize="lg" fontWeight="800" color="var(--color-black)" letterSpacing="-0.02em">
          Organizations
        </Text>
        <Text fontSize="sm" color="var(--color-dark-gray)">
          {organizations.length} {organizations.length === 1 ? 'organization' : 'organizations'}
        </Text>
      </HStack>

      {organizations.length === 0 ? (
        <Box px={5} py={8} textAlign="center">
          <Text color="var(--color-dark-gray)">No organizations linked to this tender.</Text>
        </Box>
      ) : (
        <VStack align="stretch" gap={0}>
          {organizations.map((org, index) => (
            <OrganizationCard
              org={org}
              index={index}
              key={org.id ?? org.label ?? index}
              open={openOrgIndex === index}
              onOpenChange={(e) => setOpenOrgIndex(e.open ? index : null)}
            />
          ))}
        </VStack>
      )}
    </Box>
  )
}
