"use client";

import { useState, Suspense } from "react";
import { Box, Heading, Text, VStack, Icon } from "@chakra-ui/react";
import { Button } from "@/elements/button";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toaster } from "@/elements/toaster";
import { LuMail, LuCheckCircle } from "react-icons/lu";

function VerifyEmailContent() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const auth = useAuth();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleResend = async () => {
    if (!email) {
      toaster.create({ title: "Email not found", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await auth.resendVerificationEmail(email);
      setSent(true);
      toaster.create({ title: "Verification email sent", type: "success" });
    } catch (error) {
      toaster.create({ title: "Failed to resend", description: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="bg.subtle" px="4">
      <Box w="full" maxW="400px" bg="bg" p="8" borderRadius="xl" boxShadow="lg" textAlign="center">
        <VStack gap="6">
          <Box p="4" bg="primary/10" borderRadius="full" _dark={{ bg: "primary/30" }}>
            <Icon boxSize="12" color="primary">
              {sent ? <LuCheckCircle /> : <LuMail />}
            </Icon>
          </Box>

          <Box>
            <Heading size="lg" mb="2">Check Your Email</Heading>
            <Text color="fg.muted">
              We've sent a verification link to{" "}
              <Text as="span" fontWeight="semibold">{email || "your email"}</Text>
            </Text>
          </Box>

          <Text fontSize="sm" color="fg.muted">
            Click the link in the email to verify your account. If you don't see it, check your spam folder.
          </Text>

          <VStack gap="3" w="full">
            <Button w="full" variant="outline" onClick={handleResend} loading={loading} loadingText="Sending..." className="!bg-primary !text-white hover:!bg-primary/90">
              Resend Verification Email
            </Button>
            <Link href="/auth/sign-in" style={{ width: "100%" }}>
              <Button w="full" variant="ghost" className="!bg-primary !text-white hover:!bg-primary/90">
                Back to Sign In
              </Button>
            </Link>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Box minH="100vh" display="flex" alignItems="center" justifyContent="center">Loading...</Box>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
