"use client";

import { useState } from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
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
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="bg.subtle" px="4">
      <Box w="full" maxW="400px" bg="bg" p="8" borderRadius="xl" boxShadow="lg">
        <VStack gap="6" align="stretch">
          <Box textAlign="center">
            <Heading size="xl" mb="2">Update Password</Heading>
            <Text color="fg.muted">Enter your new password</Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack gap="4" align="stretch">
              <Box>
                <InputField
                  label="New Password"
                  name="password"
                  type="password"
                  placeholder="Enter new password"
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
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                invalid={form.confirmPassword && form.password !== form.confirmPassword}
                errorText="Passwords do not match"
              />
              <Button type="submit" w="full" loading={loading} loadingText="Updating..." className="!bg-primary !text-white hover:!bg-primary/90">
                Update Password
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
}
