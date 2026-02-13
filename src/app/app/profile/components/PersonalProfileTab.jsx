'use client'

import { useState, useEffect } from 'react'
import { useGlobal } from '@/context'
import { supabase } from '@/lib/supabase'
import { toaster } from '@/elements/toaster'
import { Button } from '@/elements/button'
import { InputField } from '@/elements/input'
import { Box, Text, Heading, VStack } from '@chakra-ui/react'
import { LuSave } from 'react-icons/lu'
import Uploader from '@/elements/uploader'

export default function PersonalProfileTab() {
  const { user } = useGlobal()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    profile_img: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        profile_img: user.profile_img || user.avatar_url || user.profile_image_url || '',
      })
    }
  }, [user])

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name?.trim()) newErrors.last_name = 'Last name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!supabase) return
    if (!validate()) {
      toaster.create({ title: 'Validation Error', description: 'Please fix the errors before saving.', type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      const firstName = formData.first_name.trim() || null
      const lastName = formData.last_name.trim() || null
      const profileImg = formData.profile_img || null

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          profile_img: profileImg,
        },
      })
      if (authError) throw authError

      const userId = user?.id ?? user?.sub
      if (userId) {
        const { error: usersError } = await supabase
          .from('users')
          .update({
            first_name: firstName,
            last_name: lastName,
          })
          .eq('id', userId)
        if (usersError) throw usersError
      }

      toaster.create({ title: 'Personal profile updated', type: 'success' })
    } catch (err) {
      toaster.create({ title: 'Failed to save', description: err?.message, type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProfileImgChange = (url) => {
    updateFormData('profile_img', url || '')
  }

  return (
    <Box p="2">
      <VStack gap="5" align="stretch">
        <Box>
          <Heading
            size={{ base: 'lg', sm: 'xl' }}
            fontWeight="700"
            style={{
              background: 'linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Personal Profile
          </Heading>
        </Box>

        <Box borderRadius="xl" p="5" bg="#fafafa" borderWidth="1px" borderStyle="solid" borderColor="#efefef">
          <VStack gap="5" align="stretch">
            <Uploader
              label="Profile picture"
              entityId={user?.sub}
              baseName="profile"
              value={formData.profile_img}
              onChange={handleProfileImgChange}
              accept="image/png,image/jpeg,image/webp"
            />
            <Box display="grid" gridTemplateColumns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap="4">
              <InputField
                label="First name"
                placeholder="Enter your first name"
                value={formData.first_name}
                onChange={(e) => updateFormData('first_name', e.target.value)}
                required
                invalid={!!errors.first_name}
                errorText={errors.first_name}
              />
              <InputField
                label="Last name"
                placeholder="Enter your last name"
                value={formData.last_name}
                onChange={(e) => updateFormData('last_name', e.target.value)}
                required
                invalid={!!errors.last_name}
                errorText={errors.last_name}
              />
                <InputField
                  label="Email"
                  type="email"
                  placeholder="Email"
                  value={user?.email ?? ''}
                  disabled
                  helperText="Email cannot be changed here"
                />
              
            </Box>
          </VStack>
        </Box>

        <Box display="flex" justifyContent="flex-end">
          <Button
            type="button"
            onClick={handleSave}
            loading={isSubmitting}
            loadingText="Saving..."
            size="md"
            leftIcon={<LuSave size={18} />}
            style={{
              background: 'linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)',
              color: 'white',
              fontWeight: '600',
            }}
            _hover={{ transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(31, 106, 225, 0.4)' }}
          >
            Save Personal Profile
          </Button>
        </Box>
      </VStack>
    </Box>
  )
}
