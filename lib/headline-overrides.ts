/**
 * VA Home Offer — Virginia
 * Dynamic-headline override table for /v2 landing page.
 *
 * Each entry's `match` regex is tested against the sanitized `utm_content`
 * (= ad.name per locked URL params convention). First match wins.
 *
 * Naming contract: {ConceptCode}-{ConceptName}-{CopyVariant}-{Geo}
 * Full rules: ~/.claude/projects/-Users-williamyu/memory/feedback_ad-name-scent-contract.md
 *
 * 🚫 NEVER add B-prefix entries here. Concept B (Mailroom) is RETIRED.
 */

export type HeadlineOverride = {
  match: RegExp
  h1: string
  sub: string
}

export const HEADLINE_OVERRIDES: HeadlineOverride[] = [
  // A1 — CashRush
  {
    match: /^A1-CashRush-/i,
    h1: "Lock In Your Cash Offer Before The Virginia Market Cools",
    sub: "Virginia homeowners 55+ are getting cash in 24 hours. Same price at closing.",
  },
  // A2 — Pre2000Inspect
  {
    match: /^A2-Pre2000Inspect-/i,
    h1: "Skip The Inspection. We Buy Pre-2000 Houses As-Is.",
    sub: "Built before 2000? Doesn't have to pass anything. Cash offer in 24 hours.",
  },
  // A3 — RepairCost10K (figure updated to $20,400)
  {
    match: /^A3-RepairCost10K-/i,
    h1: "Don't Pay The $20,400 Repair Bill. Walk Away With Cash.",
    sub: "Average repair cost just hit $20,400. We buy as-is. You pick the date.",
  },
  // A4 — 55EquityRecord
  {
    match: /^A4-55EquityRecord-/i,
    h1: "Sitting On Record Equity? See What Your Virginia Home Is Actually Worth.",
    sub: "Most Virginia owners 55+ don't know. Free cash offer in 24 hours.",
  },
  // A5 — SalesFallApart
  {
    match: /^A5-SalesFallApart-/i,
    h1: "1 In 4 Virginia Home Sales Fall Apart. Ours Don't.",
    sub: "Virginia sellers 55+ are skipping the listing process. 14-day cash close.",
  },
  // A6 — VacantHouse
  {
    match: /^A6-VacantHouse-/i,
    h1: "Vacant House In Virginia? We'll Buy It In 14 Days.",
    sub: "Long-term owners 45+ are getting cash without lifting a finger.",
  },
  // C1 — YearBuilt
  {
    match: /^C1-YearBuilt-/i,
    h1: "Pre-2014 Virginia Home? See What It's Actually Worth.",
    sub: "Long-built Virginia homes are sitting on record equity. 14-day cash close, no repairs.",
  },
  // C2 — YearsOwned
  {
    match: /^C2-YearsOwned-/i,
    h1: "Owned Your Virginia Home 10+ Years? See Your Number Today.",
    sub: "Long-term Virginia owners are sitting on the strongest equity in years. As-is, 14-day cash close.",
  },
  // D2 — AgentVsCash
  {
    match: /^D2-AgentVsCash-/i,
    h1: "Would You Rather Wait 60 Days Or Get Cash In 14?",
    sub: "Most Virginia owners 45+ are skipping the listing. Same price at closing, no commissions.",
  },
]

export const DEFAULT_HEADLINE = {
  h1: "Sell Your Virginia House For Cash. In 24 Hours.",
  sub: "Fair cash offers, no fees, no commissions. Local Virginia team.",
}
