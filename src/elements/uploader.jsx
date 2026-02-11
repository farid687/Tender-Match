'use client'

import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { FaFilePdf } from 'react-icons/fa6'
import { LuUpload, LuX } from 'react-icons/lu'
import { supabase } from '@/lib/supabase'
import { Button } from '@/elements/button'
import { IconButton } from '@/elements/icon-button'
import { Box, Heading, Text } from '@chakra-ui/react'


const Uploader = ({
  label,
  value,
  onChange,
  entityId,
  folder = '',
  baseName = 'file',
  bucket = 'assets',
  accept = 'image/png,application/pdf',
  disabled = false,
  resetKey,
}) => {
  const [uiFileName, setUiFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef(null)
  const progressTimerRef = useRef(null)

  const startProgress = () => {
    setProgress(10)
    if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? 95 : prev + 5))
    }, 200)
  }

  const stopProgress = (finalValue = 100) => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
    setProgress(finalValue)
  }

  const uploadFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !entityId || !supabase) return
    try {
      setLoading(true)
      setErr(false)
      startProgress()

      const ext = file.name.split('.').pop() || 'bin'
      const fileName = `${baseName}.${ext}`
      const storageKey = `${folder}/${entityId}/${fileName}`

      const { error } = await supabase.storage.from(bucket).upload(storageKey, file, { upsert: true })
      if (error) throw error

      setUiFileName(file.name)
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storageKey)
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`
      onChange(publicUrl)
      stopProgress(100)
    } catch (e) {
      console.error('Upload failed:', e)
      setErr(true)
      stopProgress(0)
    } finally {
      setLoading(false)
    }
    e.target.value = ''
  }

  const handleDelete = () => {
    onChange('')
    setUiFileName('')
  }

  useEffect(() => {
    setUiFileName('')
    setLoading(false)
    setErr(false)
    setProgress(0)
  }, [resetKey])

  const displayName =
    uiFileName ||
    (value ? decodeURIComponent((value.split('/').pop() || '').split('?')[0]) : 'No file chosen')
  const isImage = value?.match(/\.(png|jpe?g|gif|webp)(\?|$)/i)

  return (
    <Box className="flex flex-col">
      {label && (
        <Heading p={0} m={0} fontWeight="medium" fontSize="sm" mb={2}>
          {label}
        </Heading>
      )}

      {!(value || uiFileName) && (
        <Button
          variant="outline"
          size="sm"
          mb={2}
          width="max-content"
          onClick={() => inputRef.current?.click()}
          disabled={loading || disabled || !entityId}
          colorScheme="primary"
        >
          <LuUpload size={18} style={{ marginRight: 8 }} />
          Upload file
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={uploadFile}
        className="hidden"
        disabled={loading || disabled}
      />

      {(loading || value || uiFileName) && (
        <Box
          w="max-content"
          rounded="xl"
          borderWidth="1px"
          borderColor="gray.200"
          bg="white"
          p={2}
          shadow="sm"
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={3}>
            <Box display="flex" alignItems="center" gap={3} minW={0} flex={1}>
              {value && isImage ? (
                <Box position="relative" w="50px" h="38px" flexShrink={0} rounded="md" overflow="hidden">
                  <Image src={value} fill sizes="50px" alt="" className="object-cover" />
                </Box>
              ) : (
                <FaFilePdf size={20} className="text-primary" style={{ flexShrink: 0 }} />
              )}
              <Text
                fontSize="sm"
                fontWeight="medium"
                noOfLines={1}
                color={err ? 'red.600' : value || uiFileName ? 'gray.800' : 'gray.500'}
              >
                {loading ? 'Uploading…' : err ? 'Upload failed' : displayName}
              </Text>
            </Box>
            {(value || uiFileName) && (
              <IconButton
                aria-label={`Remove ${label || 'file'}`}
                onClick={handleDelete}
                variant="outline"
                size="sm"
                rounded="full"
              >
                <LuX size={18} />
              </IconButton>
            )}
          </Box>
          {loading && (
            <Box mt={3}>
              <Box
                w="100%"
                maxW="full"
                h="2"
                bg="gray.100"
                rounded="full"
                overflow="hidden"
              >
                <Box
                  h="100%"
                  bg="primary.500"
                  rounded="full"
                  transition="width 0.2s"
                  style={{ width: `${progress}%` }}
                />
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export default Uploader
