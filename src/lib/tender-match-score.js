

/**
 * ============================================================
 * Tender–Company Match Scoring Engine (Enterprise Grade)
 * ============================================================
 * Weighted evaluation with automatic exclusion criteria.
 * Fully configurable, immutable rules, pluggable scoring modules.
 *
 * Classification:
 * 75–100% → GO
 * 45–74%  → PARTNER
 * 0–44%   → NO-GO
 *
 * Some criteria can trigger automatic NO-GO regardless of score.
 * ============================================================
 */

/* ============================================================
   CONFIGURATION (IMMUTABLE BUSINESS RULES)
   ============================================================ */

   export const WEIGHTS = Object.freeze({
    CPV: 40,
    REGION: 15,
    CONTRACT_TYPE: 10,
    CONTRACT_VALUE: 15,
    CERTIFICATION: 10,
    PORTFOLIO: 10,
  });
  
  export const CPV_POINTS = Object.freeze({
    PRIMARY: 40,
    SECONDARY: 30,
    RELATED: 20,
  });
  
  export const CONTRACT_VALUE_POINTS = Object.freeze({
    WITHIN: 15,
    SLIGHTLY_ABOVE: 8,
    MODERATELY_ABOVE: 4,
  });
  
  export const CERTIFICATION_POINTS = Object.freeze({
    ALL: 10,
    PARTIAL: 5,
  });
  
  export const THRESHOLDS = Object.freeze({
    GO_MIN: 75,
    PARTNER_MIN: 45,
  });
  
  export const NO_GO_REASONS = Object.freeze({
    NO_CPV_OVERLAP: 'no_cpv_overlap',
    CONTRACT_TYPE_MISMATCH: 'contract_type_mismatch',
    CERTIFICATION_MISSING: 'certification_missing',
    REGION_MISMATCH: 'region_mismatch',
  });
  
  const NO_GO_CRITERIA = Object.freeze([
    'cpv',
    'region',
    'contractType',
    'certification',
  ]);
  
  const TOTAL_WEIGHT = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  
  /* ============================================================
     GENERIC HELPERS
     ============================================================ */
  
  const normalize = (s) =>
    typeof s === 'string'
      ? s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/-/g, ' ')
      : '';
  
  const toPositiveNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  
  const cpvPrefix = (code) => {
    const digits = normalize(code).replace(/\D/g, '').slice(0, 4);
    return digits.length === 4 ? digits : '';
  };
  
  const createScore = ({
    points = 0,
    max,
    level,
    skipped = false,
    noGo = false,
    noGoReason,
    extra = {},
  }) => ({
    points,
    max,
    score: max ? Math.round((points / max) * 100) : 0,
    level,
    skipped,
    noGo,
    noGoReason,
    ...extra,
  });
  
  /* ============================================================
     SCORING CRITERIA
     ============================================================ */
  
  /* --- CPV --- */
  const scoreCpv = (companyCpvs = [], cpvMain = '', cpvCodes = [], cpvMap = {}) => {
    const companyCodes = new Set(
      companyCpvs.map((id) => normalize(cpvMap[id])).filter(Boolean)
    );
  
    const companyPrefixes = new Set([...companyCodes].map(cpvPrefix).filter(Boolean));
  
    const mainCode = normalize(cpvMain);
    const additional = (Array.isArray(cpvCodes) ? cpvCodes : [])
      .map(normalize)
      .filter((c) => c && c !== mainCode);
  
    const mainMatch = mainCode && companyCodes.has(mainCode);
    const secondaryMatch = additional.some((c) => companyCodes.has(c));
    const relatedMatch =
      (mainCode && companyPrefixes.has(cpvPrefix(mainCode))) ||
      additional.some((c) => companyPrefixes.has(cpvPrefix(c)));
  
    if (mainMatch)
      return createScore({
        points: CPV_POINTS.PRIMARY,
        max: WEIGHTS.CPV,
        level: 'primary',
      });
  
    if (secondaryMatch)
      return createScore({
        points: CPV_POINTS.SECONDARY,
        max: WEIGHTS.CPV,
        level: 'secondary',
      });
  
    if (relatedMatch)
      return createScore({
        points: CPV_POINTS.RELATED,
        max: WEIGHTS.CPV,
        level: 'related',
      });
  
    return createScore({
      max: WEIGHTS.CPV,
      level: 'none',
      noGo: true,
      noGoReason: NO_GO_REASONS.NO_CPV_OVERLAP,
    });
  };
  
  /* --- REGION ---
   * Exact preferred region → 15%
   * Nationwide (company.target_tenders === 'european' or 'both') → 15%
   * Outside preferred and not nationwide → 0%
   */
  const scoreRegion = (companyRegions = [], tenderRegion = '', regionMap = {}, targetTenders = '') => {
    const companyNames = new Set(
      companyRegions.map((id) => normalize(regionMap[id])).filter(Boolean)
    );
    const tenderName = normalize(tenderRegion);
    const target = normalize(targetTenders);

    if (!tenderName)
      return createScore({ max: WEIGHTS.REGION });

    const isPreferredRegion = companyNames.size > 0 && companyNames.has(tenderName);
    const nationwide = target === 'european' || target === 'both';

    if (!companyNames.size)
      return createScore({
        points: WEIGHTS.REGION,
        max: WEIGHTS.REGION,
        skipped: true,
      });

    const match = isPreferredRegion || nationwide;

    return createScore({
      points: match ? WEIGHTS.REGION : 0,
      max: WEIGHTS.REGION,
      noGo: !match,
      noGoReason: !match ? NO_GO_REASONS.REGION_MISMATCH : undefined,
    });
  };
  
  /* --- CONTRACT TYPE --- */
  const scoreContractType = (companyTypes = [], tenderType = '') => {
    const companySet = new Set(companyTypes.map(normalize).filter(Boolean));
    const tenderValue = normalize(tenderType);
  
    if (!tenderValue)
      return createScore({
        points: companySet.size ? 0 : WEIGHTS.CONTRACT_TYPE,
        max: WEIGHTS.CONTRACT_TYPE,
        skipped: !companySet.size,
      });
  
    const match = companySet.has(tenderValue);
  
    return createScore({
      points: match ? WEIGHTS.CONTRACT_TYPE : 0,
      max: WEIGHTS.CONTRACT_TYPE,
      noGo: !match,
      noGoReason: !match ? NO_GO_REASONS.CONTRACT_TYPE_MISMATCH : undefined,
    });
  };
  
  /* --- CONTRACT VALUE --- */
  const scoreContractValue = (companyRange, tenderValue) => {
    const range = toPositiveNumber(companyRange);
    const value = toPositiveNumber(tenderValue);
  
    if (!value)
      return createScore({
        points: WEIGHTS.CONTRACT_VALUE,
        max: WEIGHTS.CONTRACT_VALUE,
        skipped: true,
      });
  
    if (!range) return createScore({ max: WEIGHTS.CONTRACT_VALUE });
  
    if (value <= range)
      return createScore({
        points: CONTRACT_VALUE_POINTS.WITHIN,
        max: WEIGHTS.CONTRACT_VALUE,
        level: 'within',
      });
  
    if (value <= range * 1.2)
      return createScore({
        points: CONTRACT_VALUE_POINTS.SLIGHTLY_ABOVE,
        max: WEIGHTS.CONTRACT_VALUE,
        level: 'slightly_above',
      });
  
    if (value <= range * 1.5)
      return createScore({
        points: CONTRACT_VALUE_POINTS.MODERATELY_ABOVE,
        max: WEIGHTS.CONTRACT_VALUE,
        level: 'moderately_above',
      });
  
    return createScore({
      max: WEIGHTS.CONTRACT_VALUE,
      level: 'far',
    });
  };
  
  /* --- CERTIFICATIONS ---
   * No certification required → 10% neutral.
   * If required: all present → 10%; partial (≥ half) → 5%; less than half → hard exclusion (no-go).
   * Company cert name from: certification.name | certifications.name | name (normalized).
   */
  const scoreCertification = (companyCerts = [], tenderRequired = []) => {
    const required = (Array.isArray(tenderRequired) ? tenderRequired : [])
      .map((r) => (typeof r === 'string' ? r : r?.name ?? r?.label ?? ''))
      .map(normalize)
      .filter(Boolean);

    if (!required.length)
      return createScore({
        points: WEIGHTS.CERTIFICATION,
        max: WEIGHTS.CERTIFICATION,
        skipped: true,
      });

    const companyNames = new Set(
      (Array.isArray(companyCerts) ? companyCerts : [])
        .map((c) => c?.certification?.name ?? c?.certifications?.name ?? c?.name)
        .filter(Boolean)
        .map(normalize)
    );

    const matched = required.filter((r) => companyNames.has(r)).length;
    const total = required.length;
    const halfOrMore = total > 0 && matched >= Math.ceil(total / 2);

    if (matched === total)
      return createScore({
        points: CERTIFICATION_POINTS.ALL,
        max: WEIGHTS.CERTIFICATION,
        level: 'all',
        extra: { matched, total },
      });

    if (halfOrMore)
      return createScore({
        points: CERTIFICATION_POINTS.PARTIAL,
        max: WEIGHTS.CERTIFICATION,
        level: 'partial',
        extra: { matched, total },
      });

    return createScore({
      max: WEIGHTS.CERTIFICATION,
      level: 'none',
      noGo: true,
      noGoReason: NO_GO_REASONS.CERTIFICATION_MISSING,
      extra: { matched, total },
    });
  };
  
  /* --- PORTFOLIO (PLACEHOLDER) --- */
  // TODO: Replace with semantic similarity / embedding scoring
  const scorePortfolio = () =>
    createScore({
      points: WEIGHTS.PORTFOLIO,
      max: WEIGHTS.PORTFOLIO,
      skipped: true,
    });
  
  /* ============================================================
     CRITERIA REGISTRY (PLUG-AND-PLAY)
     ============================================================ */
  
  const CRITERIA = Object.freeze({
    cpv: (company, tender, lookups) =>
      scoreCpv(company?.cpvs, tender?.cpv_main, tender?.cpv_codes, lookups.cpvIdToCode),
  
    region: (company, tender, lookups) =>
      scoreRegion(company?.region_interest, tender?.nut_label, lookups.regionIdToName, company?.target_tenders),
  
    contractType: (company, tender) =>
      scoreContractType(company?.contract_type, tender?.contract_nature),
  
    contractValue: (company, tender) =>
      scoreContractValue(company?.contract_range, tender?.estimated_value_amount),
  
    certification: (company, tender) =>
      scoreCertification(company?.company_certification, tender?.certification_required),
  
    portfolio: () => scorePortfolio(),
  });
  
  /* ============================================================
     RECOMMENDATION ENGINE
     ============================================================
     Recommendation is based only on total percentage (no automatic
     NO-GO override). Failed criteria (CPV, region, contract type,
     certification) already contribute 0 points to the total.
     75–100% → GO, 45–74% → PARTNER, 0–44% → NO-GO.
     noGo / noGoReasons are still returned for UI (which criteria failed).
  */
  const getRecommendation = (breakdown, percentage) => {
    const reasons = NO_GO_CRITERIA
      .map((k) => breakdown[k]?.noGoReason)
      .filter(Boolean);

    if (percentage >= THRESHOLDS.GO_MIN)
      return { recommendation: 'GO', noGo: false, noGoReasons: reasons.length ? reasons : undefined };
    if (percentage >= THRESHOLDS.PARTNER_MIN)
      return { recommendation: 'PARTNER', noGo: false, noGoReasons: reasons.length ? reasons : undefined };
    return { recommendation: 'NO-GO', noGo: false, noGoReasons: reasons.length ? reasons : undefined };
  };
  
  /* ============================================================
     PUBLIC API
     ============================================================ */
  
  export const computeMatchScore = (company, tender, lookups = {}) => {
    const breakdown = Object.fromEntries(
      Object.entries(CRITERIA).map(([key, scorer]) => [
        key,
        scorer(company, tender, lookups),
      ])
    );
  
    const totalPoints = Object.values(breakdown)
      .reduce((sum, c) => sum + (c.points ?? 0), 0);
  
    const percentage = Math.round((totalPoints / TOTAL_WEIGHT) * 100);
    const clamped = Math.min(100, Math.max(0, percentage));
  
    const { recommendation, noGo, noGoReasons } =
      getRecommendation(breakdown, clamped);
  
    return {
      overallPercentage: clamped,
      breakdown,
      recommendation,
      noGo,
      noGoReasons,
    };
  };
  
  export const computeMatchScores = (company, tenders, lookups = {}) => {
    const list = Array.isArray(tenders) ? tenders : [tenders].filter(Boolean);
    return list.map((t) => ({
      tenderId: t?.tender_id ?? t?.id ?? null,
      ...computeMatchScore(company, t, lookups),
    }));
  };
  
  export const computeMatchMapForCompany = (company, tenders, lookups = {}) => {
    const list = Array.isArray(tenders) ? tenders : [tenders].filter(Boolean);
    const map = new Map();
  
    for (const t of list) {
      const tenderId = t?.tender_id ?? t?.id ?? null;
      const result = computeMatchScore(company, t, lookups);
  
      map.set(tenderId, {
        overallPercentage: result.overallPercentage,
        criteriaCount: Object.keys(CRITERIA).length,
        breakdown: result.breakdown,
        recommendation: result.recommendation,
        noGo: result.noGo,
        noGoReasons: result.noGoReasons,
      });
    }
  
    return map;
  };
