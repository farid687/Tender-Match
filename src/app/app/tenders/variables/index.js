// Tender filter options and display helpers
import moment from 'moment'

export const BOOLEAN_FILTER_OPTIONS = [
  { id: 'any', name: 'Any' },
  { id: 'yes', name: 'Yes' },
  { id: 'no', name: 'No' },
]

export const CARDS_PER_PAGE = 10

export const DEFAULT_FILTERS = {
  tender_status: '',
  contract_nature: '',
  is_european: 'any',
  is_digital_submission_possible: 'any',
  platform: '',
  publication_date_from: '',
  publication_date_to: '',
  estimated_value_min: '',
  estimated_value_max: '',
}

export const SORT_OPTIONS = [
  { id: 'publication_datetime', name: 'Publication date' },
  { id: 'closing_date', name: 'Deadline' },
  { id: 'estimated_value_amount', name: 'Estimated value' },
]

export const TIME_CATEGORIES = [
  { id: 'all', label: 'All', color: 'var(--color-dark-gray)' },
  { id: 'closing_soon', label: 'Closing Soon', color: '#dc2626' },
  { id: 'this_month', label: 'This Month', color: '#ea580c' },
  { id: 'later', label: 'Later', color: '#0d9488' },
]

export const REGION_FILTER_ITEMS = [
  { id: 'any', name: 'Any' },
  { id: 'yes', name: 'EU' },
  { id: 'no', name: 'NL' },
]

/** Bucket a closing_date (YYYY-MM-DD or ISO string) into time category. Frontend-only. */
export function getTimeBucket(closingDate) {
  if (!closingDate) return null
  const d = moment(String(closingDate).slice(0, 10)).startOf('day')
  if (!d.isValid()) return null
  const now = moment().startOf('day')
  const in7 = moment().startOf('day').add(7, 'days')
  const firstThisMonth = moment().startOf('month')
  const lastThisMonth = moment().endOf('month')
  const firstNextMonth = moment().add(1, 'month').startOf('month')
  if (d.isSameOrAfter(now) && d.isSameOrBefore(in7)) return 'closing_soon'
  if (d.isSameOrAfter(firstThisMonth) && d.isSameOrBefore(lastThisMonth)) return 'this_month'
  if (d.isSameOrAfter(firstNextMonth)) return 'later'
  return null
}

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
  const d = moment(dateStr)
  if (!d.isValid()) return dateStr
  return d.format('DD MMM YYYY')
}

export const formatTenderDateTime = (dateStr) => {
  if (!dateStr) return '—'
  const d = moment(dateStr)
  if (!d.isValid()) return dateStr
  return d.format('DD MMM YYYY, HH:mm')
}

export const getClosesInText = (closingDate) => {
  if (!closingDate) return null
  const end = moment(closingDate)
  if (!end.isValid()) return null
  const days = Math.ceil(end.diff(moment(), 'days', true))
  if (days < 0) return 'Closed'
  if (days === 0) return 'Closes today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

/** Short label for top bar: "18 DAYS" or "NVT" when closed/unknown */
export const getClosesInShort = (closingDate) => {
  const text = getClosesInText(closingDate)
  if (!text || text === 'Closed') return 'NVT'
  if (text === 'Closes today') return '0 DAYS'
  const match = text.match(/(\d+)\s*day/)
  return match ? `${match[1]} DAYS` : 'NVT'
}

export const formatTenderDateLong = (dateStr) => {
  if (!dateStr) return ''
  const d = moment(dateStr)
  if (!d.isValid()) return ''
  return d.format('MMMM D, YYYY')
}

export const getRegistrationDaysText = (closingDate) => {
  if (!closingDate) return null
  const end = moment(closingDate)
  if (!end.isValid()) return null
  const days = Math.ceil(end.diff(moment(), 'days', true))
  if (days < 0) return null
  if (days === 0) return 'Registration closes today'
  if (days === 1) return 'Registration is still open for 1 day'
  return `Registration is still open for ${days} days`
}

// ——— TenderCard display helpers ———

/** Stable match percentage 70–95 derived from tender id for display */
export const getMatchPercentage = (tenderId) => {
  if (!tenderId) return 76
  const s = String(tenderId)
  const h = [...s].reduce((acc, _, i) => (acc << 5) - acc + s.charCodeAt(i), 0)
  return 70 + (Math.abs(h) % 26)
}

/** Contract nature keys for display (works, services, supplies) */
export const CONTRACT_NATURE_KEYS = ['works', 'services', 'supplies']

export const CONTRACT_NATURE_ICON_COLOR = '#ca8a04'

/** Resolve contract nature string to normalized key */
export const getContractNatureKey = (contractNature) => {
  const key = (contractNature || 'services').toLowerCase().trim()
  return CONTRACT_NATURE_KEYS.includes(key) ? key : 'services'
}

/** Deadline color based on closing date (green / orange / red / gray) */
export const getDeadlineColor = (closingDate) => {
  const text = getClosesInText(closingDate ?? '')
  if (!text || text === 'Closed') return 'var(--color-dark-gray)'
  if (text === 'Closes today') return '#dc2626'
  const daysMatch = text.match(/(\d+)\s*day/)
  const days = daysMatch ? parseInt(daysMatch[1], 10) : null
  if (days == null) return 'var(--color-dark-gray)'
  if (days > 30) return '#16a34a'
  if (days >= 10) return '#ea580c'
  return '#dc2626'
}

export const STATUS_BADGE_BG = '#6b7280'

/** Status-specific badge background colors: AAN, VAN, EIN */
export const STATUS_BADGE_COLORS = {
  AAN: '#0d9488',
  VAN: '#ea580c',
  EIN: '#6b7280',
}

export function getStatusBadgeBg(tenderStatus) {
  if (!tenderStatus) return STATUS_BADGE_BG
  const key = String(tenderStatus).toUpperCase().trim()
  return STATUS_BADGE_COLORS[key] ?? STATUS_BADGE_BG
}
