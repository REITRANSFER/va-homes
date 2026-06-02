import { Header } from "@/components/v2/header";
import { HeroSection } from "@/components/v2/hero-section";
import { PhilosophySection } from "@/components/v2/philosophy-section";
import { VslSection } from "@/components/v2/vsl-section";
import { TrustSection } from "@/components/v2/trust-section";
import { SalesLetterSection } from "@/components/v2/sales-letter-section";
import { FaqSection } from "@/components/v2/faq-section";
import { FooterSection } from "@/components/v2/footer-section";
import { HEADLINE_OVERRIDES, DEFAULT_HEADLINE } from "@/lib/headline-overrides";

// Force dynamic rendering so searchParams is read on every request and Vercel
// never serves a stale cached variant with the wrong headline.
export const dynamic = "force-dynamic";

/**
 * Sanitize the raw utm_content for safe matching.
 * - Strip anything outside [A-Za-z0-9_-]
 * - Cap to 100 chars
 * XSS guard: we never render the raw UTM. We only match it against a regex
 * ladder and read the H1/sub from the whitelist. See:
 * ~/.claude/projects/-Users-williamyu/memory/feedback_ad-name-scent-contract.md
 */
function sanitizeUtm(raw: string | undefined): string {
  if (!raw) return "";
  return raw.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 100);
}

// Next.js 16 made searchParams ASYNC (a Promise). Server components must
// await it before accessing properties — synchronous access returns undefined
// and silently breaks the scent matcher. See:
// ~/.claude/projects/-Users-williamyu/memory/feedback_next16-searchparams-async.md
export default async function V2Page({
  searchParams,
}: {
  searchParams: Promise<{ utm_content?: string }>;
}) {
  const params = await searchParams;
  const utm = sanitizeUtm(params?.utm_content);

  // First match wins. Falls back to DEFAULT_HEADLINE for organic / unmapped.
  const matched = HEADLINE_OVERRIDES.find((row) => row.match.test(utm));
  const heroH1 = matched?.h1 ?? DEFAULT_HEADLINE.h1;
  const heroSub = matched?.sub ?? DEFAULT_HEADLINE.sub;

  return (
    <main className="v2-light min-h-screen">
      <Header />
      <HeroSection h1={heroH1} sub={heroSub} />
      <PhilosophySection />
      <VslSection />
      <TrustSection />
      <SalesLetterSection />
      <FaqSection />
      <FooterSection />
    </main>
  );
}
