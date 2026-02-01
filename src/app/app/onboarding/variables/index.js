  // Client type options
  export const clientTypes = [
    { id: 'private', name: 'Private' },
    { id: 'public', name: 'Public' },
  ]

  // Contract Type options
  export const contractTypes = [
    { id: 'services', name: 'Services' },
    { id: 'works', name: 'Works' },
    { id: 'supplies', name: 'Supplies' },
  ]

  export const contractRangeLabels = ['€50k – €250k', '€250k – €1m', '€1m – €5m', '€5m+']

  // Fixed numeric values for each contract range (used by slider)
  export const contractRangeValues = [50000, 250000, 1000000, 5000000]

  // Custom contract value limits (EUR)
  export const CONTRACT_VALUE_MIN = 0
  export const CONTRACT_VALUE_MAX = 50_000_000

  /** Parse optional custom contract range input; returns number (0–50M) or null if empty/invalid */
  export const parseCustomContractRange = (value) => {
    const raw = value?.toString().trim()
    if (!raw) return null
    const num = Number(raw)
    if (Number.isNaN(num) || num < CONTRACT_VALUE_MIN || num > CONTRACT_VALUE_MAX) return null
    return num
  }

  export const valueBandLabels = ['€50k – €250k', '€250k – €1m', '€1m – €5m', '€5m+']

  // Primary Goal options
  export const primaryGoalOptions = [
    { id: 'bid_independently', name: 'Find relevant tenders to bid independently' },
    { id: 'joint_bids', name: 'Find partners for joint bids (consortia / combinations)' },
    { id: 'subcontractor', name: 'Participate as a subcontractor' },
    { id: 'both', name: 'Explore both tenders and partnership opportunities' }
  ]

  // Target Tenders options
  export const targetTendersOptions = [
    { id: 'national', name: 'National' },
    { id: 'european', name: 'European' },
    { id: 'both', name: 'Both' }
  ]

 
  export const MAX_PORTFOLIOS = 10

  // Utility functions for formatting and parsing currency values
  export const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}m`
    } else if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}k`
    }
    return `€${value}`
  }

  export const parseContractRange = (textValue) => {
    if (typeof textValue === 'number') return textValue
    if (!textValue) return 50000
    
    // Parse formats like "€50k – €250k" or "€50k" or "50k"
    const match = textValue.toString().match(/(\d+(?:\.\d+)?)\s*([km])?/i)
    if (match) {
      const num = parseFloat(match[1])
      const unit = match[2]?.toLowerCase()
      if (unit === 'm') return num * 1000000
      if (unit === 'k') return num * 1000
      return num
    }
    return 50000
  }

  export const formatContractRange = (value) => {
    return formatCurrency(value)
  }

  /** Map a numeric contract range to slider index (0–3) for contractRangeLabels */
  export const getContractRangeIndex = (value) => {
    const num = typeof value === 'number' ? value : parseContractRange(value)
    if (num < 250000) return 0
    if (num < 1000000) return 1
    if (num < 5000000) return 2
    return 3
  }

  /** Map slider index (0–3) to stored contract range value */
  export const getContractRangeValue = (index) => contractRangeValues[Math.min(3, Math.max(0, index))]

  export const formatValueBand = (value) => {
    if (typeof value === 'number') {
      return formatCurrency(value)
    }
    // Handle legacy string values
    return value || '€50k'
  }