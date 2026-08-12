"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type DestinationSectionNavItem = {
  id: string;
  label: string;
};

type DestinationSectionNavProps = {
  sections: DestinationSectionNavItem[];
};

export function DestinationSectionNav({ sections }: DestinationSectionNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const visibleSections = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });

        const mostVisible = [...visibleSections.entries()].sort(
          (first, second) => second[1] - first[1],
        )[0];

        if (mostVisible) {
          setActiveId(mostVisible[0]);
        }
      },
      {
        rootMargin: "-28% 0px -52% 0px",
        threshold: [0.15, 0.35, 0.55, 0.75],
      },
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);

      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleSectionClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <nav
      aria-label="Japan destination sections"
      className="sticky top-20 z-30 border-y border-[#eadbd2] bg-[#fbf8f2]/92 px-5 py-6 backdrop-blur sm:px-8"
    >
      <div className="mx-auto max-w-7xl overflow-x-auto pb-1">
        <ol className="relative grid min-w-[760px] grid-cols-6 gap-0">
          <span
            aria-hidden="true"
            className="absolute left-[8.333%] right-[8.333%] top-4 h-px bg-[#e1c7ba]"
          />
          {sections.map((section, index) => {
            const isActive = activeId === section.id;

            return (
              <li className="relative flex flex-col items-center" key={section.id}>
                <button
                  aria-current={isActive ? "true" : undefined}
                  className="group flex flex-col items-center gap-4 focus-visible:outline-none"
                  onClick={() => handleSectionClick(section.id)}
                  type="button"
                >
                  <motion.span
                    animate={{
                      backgroundColor: isActive ? "#8d6255" : "#ead1c5",
                      color: isActive ? "#fffaf3" : "#fffaf3",
                      scale: isActive ? 1.08 : 1,
                    }}
                    className="relative z-10 grid h-8 w-8 place-items-center rounded-full border border-[#e6cfc3] text-xs font-medium shadow-sm shadow-[#b99686]/10"
                    transition={{ duration: 0.2 }}
                  >
                    {index + 1}
                  </motion.span>
                  <motion.span
                    animate={{
                      color: isActive ? "#6f4d43" : "#c49a8a",
                    }}
                    className="max-w-28 text-center text-[11px] font-medium uppercase tracking-[0.16em]"
                    transition={{ duration: 0.2 }}
                  >
                    {section.label}
                  </motion.span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
