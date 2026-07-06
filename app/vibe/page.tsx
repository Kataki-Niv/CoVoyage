import {
  Compass,
  FileText,
  Gem,
  Landmark,
  Shield,
  Soup,
  Users,
} from "lucide-react";

import { ContentCard } from "@/components/shared/ContentCard";
import { PageShell } from "@/components/shared/PageShell";

const vibeSections = [
  {
    title: "Culture",
    icon: Landmark,
    text: "Understand the rhythms, traditions, festivals, and everyday customs that shape a destination.",
  },
  {
    title: "Food",
    icon: Soup,
    text: "Explore local dishes, market etiquette, cafe habits, and regional ingredients worth seeking out.",
  },
  {
    title: "Etiquette",
    icon: Users,
    text: "Learn greeting norms, dress expectations, tipping patterns, and respectful visitor behavior.",
  },
  {
    title: "Hidden Gems",
    icon: Gem,
    text: "Collect quieter neighborhoods, small museums, scenic corners, and local favorites for later.",
  },
  {
    title: "Travel Tips",
    icon: Compass,
    text: "Keep practical notes on transport, timing, weather, packing, and money before arrival.",
  },
  {
    title: "Documents",
    icon: FileText,
    text: "Reserve space for passport, visa, insurance, booking, and entry requirement reminders.",
  },
  {
    title: "Safety",
    icon: Shield,
    text: "Capture emergency contacts, health guidance, areas to avoid, and situational awareness notes.",
  },
];

export default function VibePage() {
  return (
    <PageShell
      description="A destination research shell for culture, customs, food, practical tips, documents, and safety."
      eyebrow="Local vibe"
      title="Know the Place Before You Arrive"
    >
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vibeSections.map((section) => {
            const Icon = section.icon;

            return (
              <ContentCard key={section.title}>
                <Icon className="h-6 w-6 text-stone-500" />
                <h2 className="mt-5 font-serif text-3xl text-stone-900">
                  {section.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-stone-600">
                  {section.text}
                </p>
              </ContentCard>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
