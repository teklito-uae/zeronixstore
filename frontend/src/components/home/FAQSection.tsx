import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Kept short, literal and self-contained per Q&A — plain, quotable answers
// read better for both human shoppers and any crawler summarizing the page;
// there's no confirmed/guaranteed AI-citation benefit from this, so treat it
// as good content hygiene, not a growth lever. Google retired the FAQPage
// rich-result SERP feature in May 2026 — this JSON-LD no longer earns a rich
// snippet, but it's harmless structured data and mirrors the visible copy
// exactly (search engines flag FAQPage markup that doesn't match the page).
const faqs = [
  {
    question: "Does Zeronix deliver across the UAE?",
    answer:
      "Yes. We deliver to all seven Emirates — Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain. Orders over AED 200 ship free, and most Dubai addresses arrive next day.",
  },
  {
    question: "Are Zeronix products genuine and covered by warranty?",
    answer:
      "Every laptop, desktop, GPU and component we sell is 100% authentic with a full manufacturer warranty, honored locally in the UAE — most items carry a minimum 1-year warranty, extendable on select brands.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Credit and debit cards, Apple Pay, cash on delivery, and interest-free installments via Tabby on eligible orders.",
  },
  {
    question: "Can I return or exchange a product?",
    answer:
      "Yes — unopened items can be returned within 7 days of delivery for a full refund. Defective items are replaced or refunded under manufacturer warranty at no cost to you.",
  },
  {
    question: "Do you build custom gaming PCs?",
    answer:
      "Yes. Pick your CPU, GPU, RAM and storage on any desktop listing, or contact us for a fully custom build — our team assembles, stress-tests and ships it ready to plug in.",
  },
  {
    question: "How fast is delivery in Dubai and Abu Dhabi?",
    answer:
      "Same-day delivery is available for in-stock items ordered before 2 PM in Dubai; Abu Dhabi and the Northern Emirates typically arrive within 1-2 business days.",
  },
];

export function FAQSection() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="py-6 sm:py-10">
      {/* Structured data for AI/LLM answer engines and rich-result search snippets. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6 flex flex-col items-center gap-2 text-center sm:mb-8">
          <span className="flex size-11 items-center justify-center rounded-full bg-accent text-primary">
            <HelpCircle className="size-5" strokeWidth={1.75} />
          </span>
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Frequently Asked Questions</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Shipping, warranty and everything else UAE shoppers ask us most.
          </p>
        </div>

        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border">
          {faqs.map((faq) => (
            <details key={faq.question} className="group p-4 open:bg-muted/30 sm:p-5">
              <summary
                className={cn(
                  "flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground sm:text-base",
                )}
              >
                {faq.question}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 group-open:text-primary" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
