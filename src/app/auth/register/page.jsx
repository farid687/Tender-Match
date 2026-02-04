"use client";

import { useState } from "react";
import { Box, Heading, Text, VStack, HStack } from "@chakra-ui/react";
import { InputField } from "@/elements/input";
import { Button } from "@/elements/button";
import { SelectField } from "@/elements/select";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toaster } from "@/elements/toaster";
import { passwordStrength } from "check-password-strength";
import { countries, strengthColors } from "../variables";
import { useAuth } from "@/hooks/useAuth";
import { validateRegister } from "@/utils/validation";

export default function RegisterPage() {
  const [form, setForm] = useState({ 
    first_name: "", 
    last_name: "", 
    company_name: "", 
    email: "", 
    password: "", 
    confirm_password: "",
    country: "nl"
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const auth = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  
  const handleCountryChange = (details) => {
    setForm({ ...form, country: details.value[0] || "" });
  };

  const strength = form.password ? passwordStrength(form.password) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before making API call
    const validation = validateRegister(form, strength);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await auth.signUp(form.email, form.password, {
        first_name: form.first_name,
        last_name: form.last_name,
        company_name: form.company_name,
        country: form.country
      });
      toaster.create({ title: "Registration successful", description: "Please check your email to verify your account", type: "success" });
      router.push("/auth/verify-email?email=" + encodeURIComponent(form.email));
    } catch (error) {
      toaster.create({ title: "Registration failed", description: error.message, type: "error" });
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
      py={{ base: "4", sm: "5", md: "6" }}
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
        maxW="600px" 
        position="relative"
        zIndex={1}
      >
        <Box
          bg="white"
          p={{ base: "4", sm: "5", md: "6", lg: "7" }}
          borderRadius={{ base: "xl", md: "2xl" }}
          boxShadow="0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)"
          style={{
            backdropFilter: "blur(10px)",
          }}
        >
          <VStack gap={{ base: "4", md: "5" }} align="stretch">
            {/* Logo and Header */}
            <Box textAlign="center">
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                mb={{ base: "2", md: "3" }}
              >
              <Box 
                  as="img" 
                  src="/assets/MTM_Logo.png" 
                  alt="Logo" 
                  w={{ base: "90px", sm: "110px", md: "140px" }}
                  h="auto"
                  maxH="160px"
                  objectFit="contain"
                  style={{ filter: "drop-shadow(0 4px 12px rgba(31, 106, 225, 0.15))" }}
                />
              </Box>
              <Heading 
                size={{ base: "lg", sm: "xl" }}
                mb="1"
                fontWeight="700"
                style={{ 
                  background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}
              >
                Create Account
              </Heading>
              <Text 
                fontSize="sm" 
                color="#666"
                fontWeight="400"
              >
                Sign up to get started
              </Text>
            </Box>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <VStack gap="3" align="stretch">
                <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="3">
                  <InputField
                    label="First Name"
                    name="first_name"
                    placeholder="John"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    invalid={!!errors.first_name}
                    errorText={errors.first_name}
                  />
                  <InputField
                    label="Last Name"
                    name="last_name"
                    placeholder="Doe"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    invalid={!!errors.last_name}
                    errorText={errors.last_name}
                  />
                </Box>
                <InputField
                  label="Company Name"
                  name="company_name"
                  placeholder="Your Company Inc."
                  value={form.company_name}
                  onChange={handleChange}
                  required
                  invalid={!!errors.company_name}
                  errorText={errors.company_name}
                />
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
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    invalid={!!errors.password}
                    errorText={errors.password}
                  />
                  {strength && (
                    <HStack mt="1.5" gap="2" align="center">
                      <Box
                        flex="1"
                        h="3px"
                        borderRadius="full"
                        bg="#efefef"
                        overflow="hidden"
                      >
                        <Box
                          h="100%"
                          borderRadius="full"
                          style={{
                            width: strength.value === "Too weak" ? "25%" : 
                                   strength.value === "Weak" ? "50%" :
                                   strength.value === "Medium" ? "75%" : "100%",
                            background: strengthColors[strength.value] === "red.500" ? "#ff0000" :
                                       strengthColors[strength.value] === "orange.500" ? "#ff8800" :
                                       strengthColors[strength.value] === "yellow.500" ? "#ffaa00" : "#4CBB17",
                            transition: "all 0.3s ease"
                          }}
                        />
                      </Box>
                      <Text fontSize="xs" fontWeight="500" color={strengthColors[strength.value]}>
                        {strength.value}
                      </Text>
                    </HStack>
                  )}
                </Box>
                <InputField
                  label="Confirm Password"
                  name="confirm_password"
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  required
                  invalid={!!errors.confirm_password || (form.confirm_password && form.password !== form.confirm_password)}
                  errorText={errors.confirm_password || (form.confirm_password && form.password !== form.confirm_password ? "Passwords do not match" : null)}
                />
                <SelectField
                  label="Country"
                  items={countries}
                  placeholder="Select your country"
                  value={form.country ? [form.country] : []}
                  onValueChange={handleCountryChange}
                  disabled
                  required
                />
                <Button 
                  type="submit" 
                  w="full" 
                  loading={loading} 
                  loadingText="Creating account..."
                  size="md"
                  style={{
                    background: "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                    color: "white",
                    fontWeight: "600",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 14px rgba(31, 106, 225, 0.3)",
                    marginTop: "4px"
                  }}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(31, 106, 225, 0.4)"
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                >
                  Create Account
                </Button>
              </VStack>
            </form>

            {/* Footer */}
            <Box 
              textAlign="center" 
              pt="3"
              borderTop="1px solid"
              borderColor="#efefef"
            >
              <Text fontSize="sm" color="#666">
                Already have an account?{" "}
                <Link 
                  href="/auth/sign-in" 
                  className="font-semibold"
                  style={{ 
                    color: "#6b4eff",
                    textDecoration: "none",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                >
                  Sign in
                </Link>
              </Text>
            </Box>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
