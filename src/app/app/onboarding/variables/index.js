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

  export const formatValueBand = (value) => {
    if (typeof value === 'number') {
      return formatCurrency(value)
    }
    // Handle legacy string values
    return value || '€50k'
  }