// Re-export from onboarding for profile-specific use
export {
  clientTypes,
  contractTypes,
  MAX_PORTFOLIOS,
  primaryGoalOptions,
  targetTendersOptions,
  formatCurrency,
  parseContractRange,
  formatValueBand,
  CONTRACT_VALUE_MIN,
  CONTRACT_VALUE_MAX,
  parseCustomContractRange,
} from '../../onboarding/variables'

import { CONTRACT_VALUE_MIN, CONTRACT_VALUE_MAX, parseCustomContractRange } from '../../onboarding/variables'

/**
 * Compute profile completion progress (0–100) from company or draft data.
 * Counts 6 mandatory fields: region, worker_size, cpvs, contract_type, contract_range, primary_goal.
 */
export function computeProgress(companyOrDraft) {
  if (!companyOrDraft) return 0
  let completed = 0
  const total = 6
  if (companyOrDraft.region?.trim()) completed++
  if (companyOrDraft.worker_size?.trim()) completed++
  if (Array.isArray(companyOrDraft.cpvs) && companyOrDraft.cpvs.length > 0) completed++
  if (Array.isArray(companyOrDraft.contract_type) && companyOrDraft.contract_type.length > 0) completed++
  const cr = companyOrDraft.contract_range != null ? (typeof companyOrDraft.contract_range === 'number' ? companyOrDraft.contract_range : parseCustomContractRange(companyOrDraft.contract_range)) : null
  if (cr != null && cr >= CONTRACT_VALUE_MIN && cr <= CONTRACT_VALUE_MAX) completed++
  if (Array.isArray(companyOrDraft.primary_goal) && companyOrDraft.primary_goal.length > 0) completed++
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

/**
 * Return stroke color and label for the profile progress circle by percentage (0–100).
 */
export function getProgressColor(percentage) {
  if (percentage >= 100) return { stroke: '#4CBB17', label: 'Complete' }   // green
  if (percentage >= 67) return { stroke: '#3b82f6', label: 'Almost there' } // blue
  if (percentage >= 34) return { stroke: '#f59e0b', label: 'In progress' }   // amber
  return { stroke: '#ef4444', label: 'Getting started' }                     // red
}
