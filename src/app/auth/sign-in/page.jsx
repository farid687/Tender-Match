"use client";

import { useState } from "react";
import { Box, Heading, Text, VStack, HStack } from "@chakra-ui/react";
import { InputField } from "@/elements/input";
import { Button } from "@/elements/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toaster } from "@/elements/toaster";
import { useAuth } from "@/hooks/useAuth";
import { validateSignIn } from "@/utils/validation";

export default function SignInPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const auth = useAuth();
  const router = useRouter();
  const { company } = useAuth();

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
    const validation = validateSignIn(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await auth.signIn(form.email, form.password);
      toaster.create({ title: "Signed in successfully", description: "Welcome back!", type: "success" });
      if (company?.is_onboarded) {
        router.push("/app/profile");
      } else {
        router.push("/app/onboarding");
      }
    } catch (error) {
      toaster.create({ title: "Sign in failed", description: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      minH={{ base: "100dvh", lg: "100vh" }}
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      px={{ base: "3", sm: "4" }}
      py={{ base: "5", sm: "6", md: "8" }}
      overflowX="hidden"
      style={{
        background: "linear-gradient(135deg, #f7f7f7 0%, #efefef 50%, #fafafa 100%)",
        position: "relative"
      }}
    >
      {/* Decorative background elements - smaller on mobile */}
      <Box
        position="absolute"
        top="5%"
        left="5%"
        w={{ base: "180px", sm: "240px", md: "300px" }}
        h={{ base: "180px", sm: "240px", md: "300px" }}
        borderRadius="full"
        style={{
          background: "linear-gradient(135deg, rgba(31, 106, 225, 0.1) 0%, rgba(107, 78, 255, 0.1) 100%)",
          filter: "blur(80px)",
          zIndex: 0
        }}
      />
      <Box
        position="absolute"
        bottom="5%"
        right="5%"
        w={{ base: "140px", sm: "200px", md: "250px" }}
        h={{ base: "140px", sm: "200px", md: "250px" }}
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
          p={{ base: "5", sm: "6", md: "8", lg: "10" }}
          borderRadius={{ base: "xl", md: "2xl" }}
          boxShadow="0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)"
          style={{
            backdropFilter: "blur(10px)",
          }}
        >
          <VStack gap={{ base: "6", md: "8" }} align="stretch">
            {/* Logo and Header */}
            <Box textAlign="center">
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                mb={{ base: "4", md: "6" }}
              >
                <Box 
                  as="img" 
                  src="/assets/MTM_Logos.png" 
                  alt="Logo" 
                  w={{ base: "100px", sm: "120px", md: "140px" }}
                  h="auto"
                  maxH="160px"
                  objectFit="contain"
                  style={{ filter: "drop-shadow(0 4px 12px rgba(31, 106, 225, 0.15))" }}
                />
              </Box>
              <Heading 
                size={{ base: "xl", sm: "2xl" }}
                mb="2"
                fontWeight="700"
                style={{
                  background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                Welcome Back
              </Heading>
              <Text 
                fontSize="md" 
                color="#666"
                fontWeight="400"
              >
                Sign in to continue to your account
              </Text>
            </Box>

            {/* Form */}
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
                <Box>
                  <InputField
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    invalid={!!errors.password}
                    errorText={errors.password}
                  />
                  <HStack justify="flex-end" mt="2">
                    <Link 
                      href="/auth/reset-password" 
                      className="text-sm font-medium hover:underline transition-all"
                      style={{ 
                        color: "#6b4eff",
                        textDecoration: "none",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                    >
                      Forgot password?
                    </Link>
                  </HStack>
                </Box>
                
                <Button 
                  type="submit" 
                  w="full" 
                  loading={loading} 
                  loadingText="Signing in..."
                  size="lg"
                  style={{
                    background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                    color: "white",
                    fontWeight: "600",
                    padding: "12px 24px",
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
                  Sign In
                </Button>
              </VStack>
            </form>

            {/* Footer */}
            <Box 
              textAlign="center" 
              pt="4"
              borderTop="1px solid"
              borderColor="#efefef"
            >
              <Text fontSize="sm" color="#666">
                Don't have an account?{" "}
                <Link 
                  href="/auth/register" 
                  className="font-semibold"
                  style={{ 
                    color: "#6b4eff",
                    textDecoration: "none",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                >
                  Create an account
                </Link>
              </Text>
            </Box>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
