'use client'

import { createContext, useContext } from 'react'

const TenderDetailContext = createContext({
  tenderId: null,
  tender: null,
  loading: true,
  error: null,
})

export function TenderDetailProvider({ value, children }) {
  return (
    <TenderDetailContext.Provider value={value}>
      {children}
    </TenderDetailContext.Provider>
  )
}

export function useTenderDetail() {
  const ctx = useContext(TenderDetailContext)
  if (!ctx) throw new Error('useTenderDetail must be used within TenderDetailProvider')
  return ctx
}
