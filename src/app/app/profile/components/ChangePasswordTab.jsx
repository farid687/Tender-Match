'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toaster } from '@/elements/toaster'
import { Button } from '@/elements/button'
import { InputField } from '@/elements/input'
import { Box, Text, Heading, VStack, HStack } from '@chakra-ui/react'
import { passwordStrength } from 'check-password-strength'
import { useAuth } from '@/hooks/useAuth'

export default function ChangePasswordTab() {
  const auth = useAuth()
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", password: "", confirmPassword: "" })
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const handlePasswordChange = (e) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordSubmit = async () => {
    if (!supabase) return
    if (!passwordForm.currentPassword?.trim()) {
      toaster.create({ title: "Enter your current password", type: "error" })
      return
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toaster.create({ title: "Passwords do not match", type: "error" })
      return
    }

    const strength = passwordForm.password ? passwordStrength(passwordForm.password) : null
    if (strength?.value === "Too weak") {
      toaster.create({ title: "Password is too weak", type: "error" })
      return
    }

    setIsUpdatingPassword(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email) {
        toaster.create({ title: "Session expired", description: "Please sign in again.", type: "error" })
        return
      }
      await auth.signIn(session.user.email, passwordForm.currentPassword)
      await auth.updatePassword(passwordForm.password)
      toaster.create({ title: "Password updated successfully", type: "success" })
      setPasswordForm({ currentPassword: "", password: "", confirmPassword: "" })
    } catch (error) {
      const msg = error?.message?.toLowerCase?.() ?? ""
      if (msg.includes("invalid") || msg.includes("credentials")) {
        toaster.create({ title: "Current password is incorrect", type: "error" })
      } else {
        toaster.create({ title: "Failed to update password", description: error.message, type: "error" })
      }
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <Box p={{ base: "3", md: "4" }}>
      <VStack gap="5" align="stretch">
        <Box mb="2">
          <Heading size={{ base: "lg", sm: "xl" }} fontWeight="700" style={{ background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Change Password
          </Heading>
          <Text fontSize="sm" color="#666" mt="1">Update your account password</Text>
        </Box>
        <Box borderRadius="xl" p="5" bg="#fafafa" borderWidth="1px" borderStyle="solid" borderColor="#efefef">
          <Text fontSize="xs" fontWeight="600" mb="4" textTransform="uppercase" letterSpacing="wide" color="#333">Update Password</Text>
          <VStack gap="4" align="stretch">
            <InputField label="Current Password" name="currentPassword" type="password" placeholder="Enter your current password" value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
            <Box>
              <InputField label="New Password" name="password" type="password" placeholder="Create a strong password" value={passwordForm.password} onChange={handlePasswordChange} required />
              {passwordForm.password && (() => {
                const strength = passwordStrength(passwordForm.password)
                const strengthColors = { "Too weak": "#ff0000", Weak: "#ff8800", Medium: "#ffaa00", Strong: "#4CBB17" }
                return (
                  <Box mt="3">
                    <HStack gap="2" align="center" mb="2">
                      <Box flex="1" h="4px" borderRadius="full" bg="#efefef" overflow="hidden">
                        <Box h="100%" borderRadius="full" style={{ width: strength.value === "Too weak" ? "25%" : strength.value === "Weak" ? "50%" : strength.value === "Medium" ? "75%" : "100%", background: strengthColors[strength.value] || "#ff0000", transition: "all 0.3s ease" }} />
                      </Box>
                      <Text fontSize="xs" fontWeight="500" color={strengthColors[strength.value]}>{strength.value}</Text>
                    </HStack>
                  </Box>
                )
              })()}
            </Box>
            <InputField label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm your new password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required invalid={!!(passwordForm.confirmPassword && passwordForm.password !== passwordForm.confirmPassword)} errorText={passwordForm.confirmPassword && passwordForm.password !== passwordForm.confirmPassword ? "Passwords do not match" : undefined} />
            <Button type="button" onClick={handlePasswordSubmit} loading={isUpdatingPassword} loadingText="Updating..." size="md" style={{ background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)", color: "white", fontWeight: "600", padding: "12px 24px", borderRadius: "12px", boxShadow: "0 4px 14px rgba(31, 106, 225, 0.3)" }} _hover={{ transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(31, 106, 225, 0.4)" }}>
              Update Password
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}
