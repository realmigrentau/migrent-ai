import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

interface SuburbFAQProps {
  faqs: FAQItem[];
  suburbName: string;
}

export default function SuburbFAQ({ faqs, suburbName }: SuburbFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="scroll-mt-8">
      <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-2)] overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <span className="font-medium text-[var(--color-ink)] pr-4">
                {faq.q}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-[var(--color-ink-3)] shrink-0 transition-transform duration-200 ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5 pt-0">
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
