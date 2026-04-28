"use client";

import { useState } from "react";
import { FAQItem } from "@/lib/types";

interface FAQProps {
  items: FAQItem[];
  maxVisible?: number;
  showAll?: boolean;
}

export default function FAQ({ items, maxVisible = 5, showAll = false }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const displayItems = showAll ? items : items.slice(0, maxVisible);

  return (
    <div className="space-y-3">
      {displayItems.map((item, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-xl overflow-hidden bg-white"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#F5F7FA] transition-colors"
          >
            <span className="font-semibold text-[#231F20] text-sm sm:text-base pr-4">
              {item.question}
            </span>
            <span
              className={`flex-shrink-0 w-6 h-6 rounded-full bg-[#00AEEF]/10 flex items-center justify-center transition-transform duration-200 ${
                openIndex === index ? "rotate-180" : ""
              }`}
            >
              <svg className="w-3.5 h-3.5 text-[#00AEEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
          {openIndex === index && (
            <div className="px-6 pb-5">
              <p className="text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
