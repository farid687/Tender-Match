// Tender filter options and display helpers

export const BOOLEAN_FILTER_OPTIONS = [
  { id: 'any', name: 'Any' },
  { id: 'yes', name: 'Yes' },
  { id: 'no', name: 'No' },
]

export const CARDS_PER_PAGE = 10

export const formatTenderCurrency = (value) => {
  if (value == null || value === '') return 'Not Provided'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  if (num >= 1_000_000) return `€${(num / 1_000_000).toFixed(1)}m`
  if (num >= 1_000) return `€${(num / 1_000).toFixed(0)}k`
  return `€${num}`
}

export const formatTenderDate = (dateStr) => {
  if (!dateStr) return 'Not Confirmed'
  try {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export const formatTenderDateTime = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export const getClosesInText = (closingDate) => {
  if (!closingDate) return null
  try {
    const end = new Date(closingDate)
    const now = new Date()
    if (Number.isNaN(end.getTime())) return null
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    if (days < 0) return 'Closed'
    if (days === 0) return 'Closes today'
    if (days === 1) return '1 day left'
    return `${days} days left`
  } catch {
    return null
  }
}

export const formatTenderDateLong = (dateStr) => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

export const getRegistrationDaysText = (closingDate) => {
  if (!closingDate) return null
  try {
    const end = new Date(closingDate)
    const now = new Date()
    if (Number.isNaN(end.getTime())) return null
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    if (days < 0) return null
    if (days === 0) return 'Registration closes today'
    if (days === 1) return 'Registration is still open for 1 day'
    return `Registration is still open for ${days} days`
  } catch {
    return null
  }
}
