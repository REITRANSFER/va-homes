"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getConfig } from "@/lib/config";

const config = getConfig();

const salesLetterParagraphs = [
  { type: "hook-headline" as const, content: "Why Our Cash Offer Won’t Change After We See Your House (And Most Do)" },
  { type: "body" as const, content: "You already know what happens with most cash buyers. They make you an offer over the phone. It sounds great. You get excited. Maybe you start making plans. You tell your spouse. You breathe a little easier for the first time in weeks." },
  { type: "body" as const, content: "Then they show up to your house." },
  { type: "body" as const, content: "And suddenly the number changes." },
  { type: "body" as const, content: "“Oh, we didn’t realize the roof needed work.” “The foundation looks off.” “The kitchen is outdated.” One by one, they chip away at the offer. $5,000 here. $12,000 there. By the time they’re done “adjusting,” the number they hand you barely resembles the one they promised." },
  { type: "body" as const, content: "This is called the inspection trick. And it’s the oldest move in the cash buyer playbook." },
  { type: "body" as const, content: "Here’s how it works: they quote high to get you locked in. Then they send someone to “inspect” the property. That inspection isn’t to protect you. It’s to find every possible reason to lower the price. By then, you’ve already turned down other options. You’ve already told people you’re selling. You feel stuck. So you take the lower number. Because what else are you going to do?" },
  { type: "divider" as const, content: "" },
  { type: "subheadline" as const, content: "We Don’t Do That." },
  { type: "body" as const, content: `At ${config.companyName}, the number we give you is the number you get. Period.` },
  { type: "body" as const, content: `We’ve been buying homes across ${config.serviceArea} for years. ${config.ownerName} knows every neighborhood in the area. We’re not some corporate flip machine based out of another state. We’ve bought homes with leaky roofs, cracked foundations, overgrown yards, tenants who won’t leave, and houses that haven’t been touched since the ‘80s.` },
  { type: "body" as const, content: "None of that surprises us. Because we don’t quote you a number before we understand the property. We do our homework first, not after. That means when we make an offer, we’ve already factored in the roof. The kitchen. The foundation. Everything." },
  { type: "body" as const, content: "There’s no “adjustment” because there’s nothing left to adjust." },
  { type: "divider" as const, content: "" },
  { type: "subheadline" as const, content: "The 3 AM Math" },
  { type: "body" as const, content: "If you’re reading this, you’re probably doing the math. Maybe not right now. But at 3 AM when the house is quiet and the calculator app is open. Running the numbers again. Mortgage payment. Repair costs. What you owe versus what you’d walk away with." },
  { type: "body" as const, content: "You already know the answer. You just haven’t said it out loud yet." },
  { type: "body" as const, content: "Maybe it’s foreclosure breathing down your neck. Maybe you inherited a property you can’t maintain. Maybe you’re going through a divorce and the house is the last thing keeping you tied to a chapter you need to close. Maybe you’re just tired. Tired of the repairs. Tired of the tenants. Tired of pouring money into something that takes more than it gives." },
  { type: "body" as const, content: "Whatever the reason... selling your house isn’t giving up. Giving up is doing nothing while the bank decides for you." },
  { type: "divider" as const, content: "" },
  { type: "subheadline" as const, content: "How This Actually Works" },
  { type: "step" as const, content: "You tell us about your property.|It takes about two minutes. Enter your address above and answer a few quick questions. No commitment. No pressure. Just information." },
  { type: "step" as const, content: "We make you a fair cash offer within 24 hours.|We research your property, the neighborhood, comparable sales, and market conditions. Then we give you a number that won’t change. If it works for you, great. If not, no hard feelings." },
  { type: "step" as const, content: "You pick your closing date.|Need to close in 7 days? We can do that. Need 60 days to figure out your next move? That’s fine too. You’re in control. We pay all closing costs. There are no agent fees. No hidden charges. The offer is what you get." },
  { type: "divider" as const, content: "" },
  { type: "subheadline" as const, content: "Why People Choose Us Over a Traditional Listing" },
  { type: "comparison" as const, content: "" },
  { type: "divider" as const, content: "" },
  { type: "subheadline" as const, content: "One Last Thing" },
  { type: "body" as const, content: "We know you have options. You can list with a realtor and wait 90 days. You can try to sell it yourself and deal with showings, negotiations, and repair requests. You can call one of those “we buy houses” signs stuck in the ground at every intersection." },
  { type: "body" as const, content: "But if you want to talk to a real person who’s going to give you a real number that doesn’t change after they see your house... that’s us." },
  { type: "body" as const, content: "We’ve been here for years. We’ll be here tomorrow. And the offer we make today is the offer you’ll get at closing." },
  { type: "cta" as const, content: "Get your cash offer now. Or keep doing the 3 AM math alone." },
];

function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="py-4 px-4 text-base font-semibold text-muted-foreground border-b border-border"></th>
            <th className="py-4 px-4 text-base font-semibold text-[var(--accent-brand)] border-b border-border bg-[var(--accent-brand)]/10">{config.companyName}</th>
            <th className="py-4 px-4 text-base font-semibold text-muted-foreground border-b border-border">Traditional Listing</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Timeline", "7–30 days", "90–180 days"],
            ["Fees", "Zero", "5–6% commission"],
            ["Repairs", "None required", "Buyer may request"],
            ["Showings", "None", "Multiple strangers"],
            ["Offer certainty", "Guaranteed", "Can fall through"],
            ["Closing costs", "We pay", "You pay"],
          ].map(([label, us, them], i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-secondary"}>
              <td className="py-3 px-4 text-base font-medium text-foreground border-b border-border">{label}</td>
              <td className="py-3 px-4 text-base text-[var(--accent-brand)] font-medium border-b border-border">{us}</td>
              <td className="py-3 px-4 text-base text-muted-foreground border-b border-border">{them}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SalesLetterSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    const paragraphs = sectionRef.current?.querySelectorAll("[data-paragraph]");
    if (!paragraphs) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-paragraph"));
            setVisibleCount((prev) => Math.max(prev, idx + 1));
          }
        });
      },
      { threshold: 0.3 }
    );
    paragraphs.forEach((p) => observerRef.current!.observe(p));
  }, []);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver]);

  let stepCounter = 0;

  return (
    <section className="bg-background py-20 md:py-32">
      <div ref={sectionRef} className="mx-auto max-w-3xl px-6 md:px-12">
        {salesLetterParagraphs.map((p, i) => {
          const isVisible = i < visibleCount;
          if (p.type === "divider") {
            return (
              <div key={i} data-paragraph={i} className={`my-10 md:my-14 border-t border-border transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`} />
            );
          }
          if (p.type === "hook-headline") {
            return (
              <h2 key={i} data-paragraph={i} className={`text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                {p.content}
              </h2>
            );
          }
          if (p.type === "subheadline") {
            return (
              <h3 key={i} data-paragraph={i} className={`text-2xl md:text-3xl font-bold text-foreground mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                {p.content}
              </h3>
            );
          }
          if (p.type === "comparison") {
            return (
              <div key={i} data-paragraph={i} className={`my-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <ComparisonTable />
              </div>
            );
          }
          if (p.type === "step") {
            stepCounter++;
            const [title, desc] = p.content.split("|");
            return (
              <div key={i} data-paragraph={i} className={`flex gap-4 mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{ backgroundColor: "var(--accent-brand)" }}>
                  {stepCounter}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-foreground">{title}</h4>
                  <p className="text-muted-foreground mt-1 text-base leading-relaxed">{desc}</p>
                </div>
              </div>
            );
          }
          if (p.type === "cta") {
            return (
              <div key={i} data-paragraph={i} className={`mt-12 text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <button
                  onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center gap-2 text-white font-semibold text-xl px-12 py-5 rounded-2xl transition-all"
                  style={{ backgroundColor: "var(--accent-brand)" }}
                >
                  {p.content}
                </button>
              </div>
            );
          }
          return (
            <p key={i} data-paragraph={i} className={`text-lg md:text-xl leading-relaxed text-muted-foreground mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {p.content}
            </p>
          );
        })}
      </div>
    </section>
  );
}
