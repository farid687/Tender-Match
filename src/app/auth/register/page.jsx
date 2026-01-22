"use client";

import { useState } from "react";
import { Box, Heading, Text, VStack, Link as ChakraLink } from "@chakra-ui/react";
import { InputField } from "@/elements/input";
import { Button } from "@/elements/button";
import { SelectField } from "@/elements/select";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toaster } from "@/elements/toaster";
import { passwordStrength } from "check-password-strength";
import { countries, strengthColors } from "../variables";
import { useAuth } from "@/hooks/useAuth";

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
  const auth = useAuth();
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleCountryChange = (details) => {
    setForm({ ...form, country: details.value[0] || "" });
  };

  const strength = form.password ? passwordStrength(form.password) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!form.first_name || !form.last_name || !form.company_name || !form.email || !form.password || !form.confirm_password || !form.country) {
      toaster.create({ title: "Please fill in all required fields", type: "error" });
      return;
    }
    if (form.password !== form.confirm_password) {
      toaster.create({ title: "Passwords do not match", type: "error" });
      return;
    }
    if (strength?.value === "Too weak") {
      toaster.create({ title: "Password is too weak", type: "error" });
      return;
    }
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
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="bg.subtle" px="4">
      <Box w="full" maxW="500px" bg="bg" p="8" borderRadius="xl" boxShadow="lg">
        <VStack gap="6" align="stretch">
          <Box textAlign="center">
            <Box display="flex" justifyContent="center" alignItems="center">
              <Box as="img" src="/assets/MTM_Logos.svg" alt="Logo" w="100px" h="100px" />
            </Box>
            <Heading size="xl" mb="2">Create Account</Heading>
            <Text color="fg.muted">Sign up to get started</Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack gap="4" align="stretch">
              <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
                <InputField
                  label="First Name"
                  name="first_name"
                  placeholder="Enter your first name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Last Name"
                  name="last_name"
                  placeholder="Enter your last name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                />
              </Box>
              <InputField
                label="Company Name"
                name="company_name"
                placeholder="Enter your company name"
                value={form.company_name}
                onChange={handleChange}
                required
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Box>
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                {strength && (
                  <Text fontSize="xs" color={strengthColors[strength.value]} mt="1">
                    Password strength: {strength.value}
                  </Text>
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
                invalid={form.confirm_password && form.password !== form.confirm_password}
                errorText="Passwords do not match"
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
              <Button type="submit" w="full" loading={loading} loadingText="Creating account..." className="!bg-primary !text-white hover:!bg-primary/90">
                Register
              </Button>
            </VStack>
          </form>

          <Text textAlign="center" fontSize="sm">
            Already have an account?{" "}
            <ChakraLink asChild color="primary">
              <Link href="/auth/sign-in" className="!text-anchor hover:underline">Sign In</Link>
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
