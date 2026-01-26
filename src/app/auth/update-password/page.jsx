"use client";

import { useState } from "react";
import { Box, Heading, Text, VStack, HStack } from "@chakra-ui/react";
import { InputField } from "@/elements/input";
import { Button } from "@/elements/button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toaster } from "@/elements/toaster";
import { passwordStrength } from "check-password-strength";

export default function UpdatePasswordPage() {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const strength = form.password ? passwordStrength(form.password) : null;
  const strengthColors = { "Too weak": "red.500", Weak: "orange.500", Medium: "yellow.500", Strong: "green.500" };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toaster.create({ title: "Passwords do not match", type: "error" });
      return;
    }
    if (strength?.value === "Too weak") {
      toaster.create({ title: "Password is too weak", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await auth.updatePassword(form.password);
      toaster.create({ title: "Password updated successfully", type: "success" });
      router.push("/auth/sign-in");
    } catch (error) {
      toaster.create({ title: "Failed to update password", description: error.message, type: "error" });
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
                Update Password
              </Heading>
              <Text 
                fontSize="md" 
                color="#666"
                fontWeight="400"
              >
                Enter your new password below
              </Text>
            </Box>

            <form onSubmit={handleSubmit}>
              <VStack gap="5" align="stretch">
                <Box>
                  <InputField
                    label="New Password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  {strength && (
                    <Box mt="3">
                      <HStack gap="2" align="center" mb="2">
                        <Box
                          flex="1"
                          h="4px"
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
                    </Box>
                  )}
                </Box>
                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  invalid={form.confirmPassword && form.password !== form.confirmPassword}
                  errorText="Passwords do not match"
                />
                <Button 
                  type="submit" 
                  w="full" 
                  loading={loading} 
                  loadingText="Updating..."
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
                  Update Password
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
