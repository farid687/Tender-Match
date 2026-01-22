"use client";

import { GlobalProvider, useGlobal } from "@/context";


// Re-export for backward compatibility
export const AuthProvider = GlobalProvider;
export const useAuth = useGlobal;
