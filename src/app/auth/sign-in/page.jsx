"use client";

import { useState } from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { InputField } from "@/elements/input";
import { Button } from "@/elements/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toaster } from "@/elements/toaster";
import { useAuth } from "@/hooks/useAuth";

export default function SignInPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
const auth= useAuth();
  const router = useRouter();
  const { company } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.signIn(form.email, form.password);
      toaster.create({ title: "Signed in successfully", description: "Welcome back!", type: "success" });
      if (company?.is_onboarded) {
        router.push("/");
      } else {
        router.push("/onboarding");
      }
    } catch (error) {
      toaster.create({ title: "Sign in failed", description: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="bg.subtle" px="4">
      <Box w="full" maxW="400px" bg="bg" p="8" borderRadius="xl" boxShadow="lg">
        <VStack gap="6" align="stretch">
          <Box textAlign="center">
            <Box  display="flex" justifyContent="center" alignItems="center">
              <Box as="img" src="/assets/MTM_Logos.svg" alt="Logo" w="100px" h="100px" />
            </Box>
            <Heading size="xl" mb="2">Welcome Back</Heading>
            <Text color="fg.muted">Sign in to your account</Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack gap="4" align="stretch">
              <InputField
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <Link href="/auth/reset-password" className="text-sm !text-anchor text-right hover:underline block">
                Forgot password?
              </Link>
              <Button type="submit" w="full" loading={loading} loadingText="Signing in..." className="!bg-primary !text-white hover:!bg-primary/90">
                Sign In
              </Button>
            </VStack>
          </form>

          <Text textAlign="center" fontSize="sm">
            Don't have an account?{" "}
<Link href="/auth/register" className="!text-anchor hover:underline">Register</Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
