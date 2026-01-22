"use client";

import { useState } from "react";
import { Box, Heading, Text, VStack, Icon } from "@chakra-ui/react";
import { InputField } from "@/elements/input";
import { Button } from "@/elements/button";
import Link from "next/link";
import { toaster } from "@/elements/toaster";
import { LuArrowLeft, LuMail } from "react-icons/lu";
import { useAuth } from "@/hooks/useAuth";

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ email: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const auth = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="bg.subtle" px="4">
        <Box w="full" maxW="400px" bg="bg" p="8" borderRadius="xl" boxShadow="lg" textAlign="center">
          <VStack gap="6">
            <Box p="4" bg="green.50" borderRadius="full" _dark={{ bg: "green.900/30" }}>
              <Icon boxSize="12" color="green.500"><LuMail /></Icon>
            </Box>
            <Box>
              <Heading size="lg" mb="2">Check Your Email</Heading>
              <Text color="fg.muted">
                We've sent a password reset link to <Text as="span" fontWeight="semibold">{form.email}</Text>
              </Text>
            </Box>
            <Link href="/auth/sign-in" style={{ width: "100%" }}>
              <Button w="full" variant="outline" className="!bg-primary !text-white hover:!bg-primary/90">Back to Sign In</Button>
            </Link>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="bg.subtle" px="4">
      <Box w="full" maxW="400px" bg="bg" p="8" borderRadius="xl" boxShadow="lg">
        <VStack gap="6" align="stretch">
          <Link href="/auth/sign-in" className="!text-anchor hover:underline">
            <Text display="flex" alignItems="center" gap="2" fontSize="sm" color="fg.muted" _hover={{ color: "primary" }}>
              <LuArrowLeft /> Back to Sign In
            </Text>
          </Link>

          <Box textAlign="center">
            <Heading size="xl" mb="2">Reset Password</Heading>
            <Text color="fg.muted">Enter your email to receive a reset link</Text>
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
              <Button type="submit" w="full" loading={loading} loadingText="Sending..." className="!bg-primary !text-white hover:!bg-primary/90">
                Send Reset Link
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
}
