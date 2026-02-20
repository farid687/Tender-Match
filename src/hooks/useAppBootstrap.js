"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useGlobal } from "@/context"
import { useCompany } from "@/hooks/useCompany"

export function useAppBootstrap() {
  const {
    user,
    loading: authLoading,
    setCertifications,
    setRegions,
    setCpvs,
    setCompanyCertifications,
  } = useGlobal()

  const { getCompany } = useCompany()
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!supabase) {
      setBootstrapping(false)
      return
    }

    let cancelled = false

    const init = async () => {
      try {
        // ---------- reference data ----------
        const [certRes, regionRes, cpvRes] = await Promise.all([
          supabase
            .from("certifications")
            .select("*")
            .order("category", { ascending: true }),
            

          supabase
            .from("regions")
            .select("id, name")
            .order("name", { ascending: true }),

          fetch("/api/cpvs").then((r) => (r.ok ? r.json() : [])),
        ])

        if (cancelled) return

        const certData = certRes.data ?? []
        setCertifications(
          certData.map((cert) => ({
            id: cert.id,
            code: cert.code ?? "",
            name: cert.name,
            category: cert.category ?? "Other",
            description: cert.description ?? "",
            is_equivalent: cert.is_equivalent ?? false,
          }))
        )

        const regionData = regionRes.data ?? []
        setRegions(regionData.map((r) => ({ id: r.id, name: r.name })))

        setCpvs(Array.isArray(cpvRes) ? cpvRes : [])

        // ---------- company data ----------
        if (user?.company_id) {
          await getCompany()
          if (cancelled) return

          const { data } = await supabase
            .from("company_certifications")
            .select("id, certification_id, status, notes, document, certifications(name, description, is_equivalent)")
            .eq("company_id", user.company_id)

          if (cancelled) return

          const withExisting = (data ?? []).map((c) => {
            const { certifications, certification, ...rest } = c
            const cert = certifications ?? certification ?? {}
            return {
              ...rest,
              isExisting: true,
              name: cert.name ?? "",
              description: cert.description ?? "",
              is_equivalent: cert.is_equivalent ?? false,
            }
          })
          setCompanyCertifications(withExisting)
        }

      } catch (err) {
        console.error("App bootstrap failed", err)
      } finally {
        if (!cancelled) setBootstrapping(false)
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [authLoading, user?.company_id, setCertifications, setRegions, setCpvs, setCompanyCertifications, getCompany])

  return bootstrapping
}
