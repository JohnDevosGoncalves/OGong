"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";

export interface AccordionItem {
  title: string;
  content: string | ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

function AccordionPanel({
  item,
  isOpen,
  onToggle,
  id,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
  id: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle]
  );

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        id={`${id}-trigger`}
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between py-4 px-1 text-left text-sm font-medium text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:rounded-lg"
      >
        <span>{item.title}</span>
        <svg
          className={`w-4 h-4 shrink-0 text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        style={{ height }}
        className="overflow-hidden transition-[height] duration-200 ease-in-out"
      >
        <div ref={contentRef} className="pb-4 px-1 text-sm text-muted leading-relaxed">
          {item.content}
        </div>
      </div>
    </div>
  );
}

export function Accordion({ items, className = "" }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className={className} role="presentation">
      {items.map((item, index) => (
        <AccordionPanel
          key={index}
          item={item}
          isOpen={openIndex === index}
          onToggle={() => toggle(index)}
          id={`accordion-${index}`}
        />
      ))}
    </div>
  );
}
