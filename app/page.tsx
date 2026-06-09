import { Header } from "@/components/v2/header";
import { HeroSection } from "@/components/v2/hero-section";
import { PhilosophySection } from "@/components/v2/philosophy-section";
import { VslSection } from "@/components/v2/vsl-section";
import { TrustSection } from "@/components/v2/trust-section";
import { SalesLetterSection } from "@/components/v2/sales-letter-section";
import { FaqSection } from "@/components/v2/faq-section";
import { FooterSection } from "@/components/v2/footer-section";
import { HEADLINE_OVERRIDES } from "@/lib/headline-overrides";

// Force dynamic so searchParams (utm_content) is read on every request and the
// scent matcher can swap the H1 per ad. Server-rendered, no flash.
export const dynamic = "force-dynamic";

// Strip to the safe charset and cap length. We never render the raw UTM; we only
// match it against the regex ladder and read the H1/sub from the whitelist.
function sanitizeUtm(raw: string | undefined): string {
  if (!raw) return "";
  return raw.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 100);
}

// Next 16 searchParams is async — must await before reading.
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ utm_content?: string }>;
}) {
  const params = await searchParams;
  const utm = sanitizeUtm(params?.utm_content);
  // First match wins. No match (organic / unmapped) -> pass undefined so
  // HeroSection keeps the static config headline + accent.
  const matched = HEADLINE_OVERRIDES.find((row) => row.match.test(utm));

  return (
    <main className="v2-light min-h-screen">
      <Header />
      <HeroSection h1={matched?.h1} sub={matched?.sub} />
      <PhilosophySection />
      <VslSection />
      <TrustSection />
      <SalesLetterSection />
      <FaqSection />
      <FooterSection />
    </main>
  );
}
