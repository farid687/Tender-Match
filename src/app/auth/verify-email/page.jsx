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
          background: sent 
            ? "linear-gradient(135deg, rgba(76, 187, 23, 0.1) 0%, rgba(31, 106, 225, 0.1) 100%)"
            : "linear-gradient(135deg, rgba(107, 78, 255, 0.1) 0%, rgba(31, 106, 225, 0.1) 100%)",
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
                background: sent
                  ? "linear-gradient(135deg, rgba(76, 187, 23, 0.1) 0%, rgba(76, 187, 23, 0.2) 100%)"
                  : "linear-gradient(135deg, rgba(31, 106, 225, 0.1) 0%, rgba(107, 78, 255, 0.1) 100%)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Icon 
                boxSize="16" 
                color={sent ? "#4CBB17" : "#1f6ae1"}
                style={{
                  transition: "all 0.3s ease"
                }}
              >
                {sent ? <LuCheckCircle /> : <LuMail />}
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
                We've sent a verification link to{" "}
                <Text as="span" fontWeight="600" color="#1c1c1c">{email || "your email"}</Text>
              </Text>
            </Box>

            <Text fontSize="sm" color="#666" px="4" lineHeight="1.6">
              Click the link in the email to verify your account. If you don't see it, check your spam folder.
            </Text>

            <VStack gap="3" w="full">
              <Button 
                w="full" 
                onClick={handleResend} 
                loading={loading} 
                loadingText="Sending..."
                size="lg"
                style={{
                  background: sent 
                    ? "linear-gradient(135deg, #4CBB17 0%, #3a9a12 100%)"
                    : "linear-gradient(135deg, #1f6ae1 0%, #6b4eff 100%)",
                  color: "white",
                  fontWeight: "600",
                  padding: "14px 24px",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  boxShadow: sent
                    ? "0 4px 14px rgba(76, 187, 23, 0.3)"
                    : "0 4px 14px rgba(31, 106, 225, 0.3)"
                }}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: sent
                    ? "0 6px 20px rgba(76, 187, 23, 0.4)"
                    : "0 6px 20px rgba(31, 106, 225, 0.4)"
                }}
                _active={{
                  transform: "translateY(0)"
                }}
              >
                {sent ? "Email Sent!" : "Resend Verification Email"}
              </Button>
              <Link href="/auth/sign-in" style={{ width: "100%" }}>
                <Button 
                  w="full" 
                  variant="ghost"
                  size="lg"
                  style={{
                    color: "#6b4eff",
                    fontWeight: "600",
                    padding: "14px 24px",
                    borderRadius: "12px",
                    transition: "all 0.3s ease"
                  }}
                  _hover={{
                    background: "rgba(107, 78, 255, 0.1)",
                    transform: "translateY(-1px)"
                  }}
                >
                  Back to Sign In
                </Button>
              </Link>
            </VStack>
          </VStack>
        </Box>
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
