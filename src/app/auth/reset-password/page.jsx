"use client";

import { useState } from "react";
import { Box, Heading, Text, VStack, Icon } from "@chakra-ui/react";
import { InputField } from "@/elements/input";
import { Button } from "@/elements/button";
import Link from "next/link";
import { toaster } from "@/elements/toaster";
import { LuArrowLeft, LuMail } from "react-icons/lu";
import { useAuth } from "@/hooks/useAuth";
import { validateResetPassword } from "@/utils/validation";

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ email: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});
  const auth = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before making API call
    const validation = validateResetPassword(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await auth.resetPassword(form.email);
      setSent(true);
      toaster.create({ title: "Reset link sent", description: "Check your email for the password reset link", type: "success" });
    } catch (error) {
      toaster.create({ title: "Failed to send reset link", description: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        px="4"
        py="8"
        style={{
          background: "linear-gradient(135deg, #f7f7f7 0%, #efefef 50%, #fafafa 100%)",
          position: "relative"
        }}
      >
        {/* Decorative background elements */}
        <Box
          position="absolute"
          top="10%"
          left="10%"
          w="300px"
          h="300px"
          borderRadius="full"
          style={{
            background: "linear-gradient(135deg, rgba(31, 106, 225, 0.1) 0%, rgba(107, 78, 255, 0.1) 100%)",
            filter: "blur(80px)",
            zIndex: 0
          }}
        />
        <Box
          position="absolute"
          bottom="10%"
          right="10%"
          w="250px"
          h="250px"
          borderRadius="full"
          style={{
            background: "linear-gradient(135deg, rgba(76, 187, 23, 0.1) 0%, rgba(31, 106, 225, 0.1) 100%)",
            filter: "blur(80px)",
            zIndex: 0
          }}
        />

        <Box 
          w="full" 
          maxW="480px" 
          position="relative"
          zIndex={1}
        >
          <Box
            bg="white"
            p={{ base: "8", md: "10" }}
            borderRadius="2xl"
            boxShadow="0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)"
            textAlign="center"
            style={{
              backdropFilter: "blur(10px)",
            }}
          >
            <VStack gap="8">
              <Box 
                p="6" 
                borderRadius="full"
                style={{
                  background: "linear-gradient(135deg, rgba(76, 187, 23, 0.1) 0%, rgba(76, 187, 23, 0.2) 100%)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Icon boxSize="16" color="#4CBB17">
                  <LuMail />
                </Icon>
              </Box>
              <Box>
                <Heading 
                  size="xl" 
                  mb="3"
                  fontWeight="700"
                  style={{ 
                    background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  Check Your Email
                </Heading>
                <Text color="#666" fontSize="md" lineHeight="1.6">
                  We've sent a password reset link to{" "}
                  <Text as="span" fontWeight="600" color="#1c1c1c">{form.email}</Text>
                </Text>
              </Box>
              <Text fontSize="sm" color="#666" px="4">
                Click the link in the email to reset your password. If you don't see it, check your spam folder.
              </Text>
              <Link href="/auth/sign-in" style={{ width: "100%", marginTop: "8px" }}>
                <Button 
                  w="full" 
                  size="lg"
                  style={{
                    background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                    color: "white",
                    fontWeight: "600",
                    padding: "14px 24px",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 14px rgba(31, 106, 225, 0.3)"
                  }}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(31, 106, 225, 0.4)"
                  }}
                >
                  Back to Sign In
                </Button>
              </Link>
            </VStack>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      px="4"
      py="8"
      style={{
        background: "linear-gradient(135deg, #f7f7f7 0%, #efefef 50%, #fafafa 100%)",
        position: "relative"
      }}
    >
      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="10%"
        left="10%"
        w="300px"
        h="300px"
        borderRadius="full"
        style={{
          background: "linear-gradient(135deg, rgba(31, 106, 225, 0.1) 0%, rgba(107, 78, 255, 0.1) 100%)",
          filter: "blur(80px)",
          zIndex: 0
        }}
      />
      <Box
        position="absolute"
        bottom="10%"
        right="10%"
        w="250px"
        h="250px"
        borderRadius="full"
        style={{
          background: "linear-gradient(135deg, rgba(107, 78, 255, 0.1) 0%, rgba(31, 106, 225, 0.1) 100%)",
          filter: "blur(80px)",
          zIndex: 0
        }}
      />

      <Box 
        w="full" 
        maxW="480px" 
        position="relative"
        zIndex={1}
      >
        <Box
          bg="white"
          p={{ base: "8", md: "10" }}
          borderRadius="2xl"
          boxShadow="0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)"
          style={{
            backdropFilter: "blur(10px)",
          }}
        >
          <VStack gap="8" align="stretch">
            <Link 
              href="/auth/sign-in" 
              style={{ 
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: "#6b4eff",
                fontWeight: "500",
                transition: "all 0.2s",
                width: "fit-content"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
                e.currentTarget.style.transform = "translateX(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <LuArrowLeft /> Back to Sign In
            </Link>

            <Box textAlign="center">
              <Heading 
                size="2xl" 
                mb="2"
                fontWeight="700"
                style={{ 
                  background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                Reset Password
              </Heading>
              <Text 
                fontSize="md" 
                color="#666"
                fontWeight="400"
              >
                Enter your email to receive a reset link
              </Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <VStack gap="5" align="stretch">
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  invalid={!!errors.email}
                  errorText={errors.email}
                />
                <Button 
                  type="submit" 
                  w="full" 
                  loading={loading} 
                  loadingText="Sending..."
                  size="lg"
                  style={{
                    background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                    color: "white",
                    fontWeight: "600",
                    padding: "14px 24px",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 14px rgba(31, 106, 225, 0.3)"
                  }}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(31, 106, 225, 0.4)"
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                >
                  Send Reset Link
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
