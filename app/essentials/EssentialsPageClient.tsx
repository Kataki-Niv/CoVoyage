"use client";

import {
  ArrowRight,
  BatteryCharging,
  BriefcaseBusiness,
  Check,
  FileText,
  HeartPulse,
  MapPin,
  Plane,
  Search,
  ShieldCheck,
  Shirt,
  Sun,
  Usb,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { products } from "../shop/productData";

const destinations = [
  {
    name: "Japan",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=86",
    essentials: ["Passport Holder", "Universal Travel Adapter", "Compact Power Bank", "Travel Document Organizer"],
  },
  {
    name: "Iceland",
    image:
      "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1200&q=86",
    essentials: ["Lightweight Travel Blanket", "Compact Daypack", "Reusable Water Bottle", "Compact Power Bank"],
  },
  {
    name: "Italy",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=86",
    essentials: ["Lightweight Luggage Organizer", "Passport Holder", "Universal Travel Adapter", "Reusable Water Bottle"],
  },
  {
    name: "Thailand",
    image:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=86",
    essentials: ["Compact Daypack", "Reusable Water Bottle", "Lightweight Luggage Organizer", "Memory Foam Travel Pillow"],
  },
];

const categories = [
  { name: "Travel Gear", filter: "Packing", icon: BriefcaseBusiness },
  { name: "Electronics", filter: "Tech", icon: Usb },
  { name: "Clothing", filter: "Comfort", icon: Shirt },
  { name: "Personal Care", filter: "Outdoor", icon: HeartPulse },
  { name: "Documents & Travel", filter: "Organization", icon: FileText },
  { name: "Travel Safety", filter: "Organization", icon: ShieldCheck },
  { name: "Day-trip Essentials", filter: "Outdoor", icon: Sun },
];

const checklistItems = [
  "Passport & documents",
  "Travel insurance",
  "Currency / payment setup",
  "Chargers & adapters",
  "Essential medications",
  "Offline maps",
  "Emergency contacts",
  "Accommodation details",
];

const curatedEssentials = products.slice(0, 8);

const travelProblemItems = [
  {
    problem: "Dead phone days",
    solution: "Power banks, adapters, and cable setups that keep maps and tickets close.",
    icon: BatteryCharging,
  },
  {
    problem: "Overpacked luggage",
    solution: "Compression, pouches, and organizers that make one bag feel calmer.",
    icon: BriefcaseBusiness,
  },
  {
    problem: "Long-haul discomfort",
    solution: "Soft layers and comfort pieces for planes, buses, and late check-ins.",
    icon: HeartPulse,
  },
  {
    problem: "Messy small items",
    solution: "Simple storage for documents, toiletries, chargers, and daily carry.",
    icon: ShieldCheck,
  },
];

export function EssentialsPageClient() {
  const [checkedItems, setCheckedItems] = useState<string[]>([
    "Passport & documents",
    "Chargers & adapters",
  ]);

  const toggleItem = (item: string) => {
    setCheckedItems((current) =>
      current.includes(item)
        ? current.filter((candidate) => candidate !== item)
        : [...current, item],
    );
  };

  return (
    <main className="bg-[#050505] text-[#f8f4ea]">
      <Hero />
      <DestinationEssentials />
      <Categories />
      <BeforeYouFly checkedItems={checkedItems} onToggle={toggleItem} />
      <CuratedEssentials />
      <LocalKnowledge />
      <LeavingTomorrow />
      <FinalCta />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.48fr_0.52fr] lg:items-end">
        <div className="relative z-10 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-white/52">
            COVOYAGE ESSENTIALS
          </p>
          <h1 className="mt-5 font-serif text-6xl leading-[0.95] text-white sm:text-7xl lg:text-8xl">
            Everything you might wish you packed.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-white/64">
            Everything you might need before or during a journey, curated around
            where you&apos;re going.
          </p>
          <div className="mt-9 max-w-xl border border-white/12 bg-white/[0.045] p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/46">
              Where are you going?
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-12 min-w-0 flex-1 items-center gap-3 border border-white/12 bg-black/28 px-4 text-sm text-white">
                <Search className="h-4 w-4 text-white/46" />
                <span>Japan</span>
              </div>
              <a
                className="inline-flex h-12 items-center justify-center gap-3 bg-[#f8f4ea] px-5 text-sm font-semibold text-[#050505] transition-colors hover:bg-white"
                href="#japan-essentials"
              >
                Explore Essentials
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <figure className="relative min-h-[420px] overflow-hidden border border-white/10 bg-[#151515] lg:min-h-[620px]">
          <Image
            alt="Premium travel essentials arranged beside a packed bag"
            className="absolute inset-0 h-full w-full object-cover"
            fill
            priority
            sizes="(min-width: 1024px) 52vw, calc(100vw - 40px)"
            src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1800&q=88"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.02),rgba(5,5,5,0.72)),linear-gradient(90deg,rgba(5,5,5,0.42),rgba(5,5,5,0.04))]" />
          <div className="absolute bottom-6 left-6 right-6 border border-white/12 bg-black/34 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-white/54">
              Destination to Local Vibe to Essentials
            </p>
          </div>
        </figure>
      </div>
    </section>
  );
}

function DestinationEssentials() {
  return (
    <section className="px-5 py-16 sm:px-8 lg:py-20" id="japan-essentials">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-serif text-5xl leading-tight text-white">
          Essentials for Your Next Destination
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {destinations.map((destination) => (
            <article
              className="group overflow-hidden border border-white/10 bg-[#111]"
              key={destination.name}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  alt={`${destination.name} destination`}
                  className="object-cover transition duration-700 group-hover:scale-105"
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                  src={destination.image}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(5,5,5,0.78))]" />
                <h3 className="absolute bottom-5 left-5 font-serif text-4xl text-white">
                  {destination.name}
                </h3>
              </div>
              <div className="p-5">
                <ul className="space-y-2 text-sm text-white/62">
                  {destination.essentials.map((item) => (
                    <li className="flex items-center gap-2" key={item}>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#d8b7aa]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/72 transition-colors group-hover:text-white"
                  href={`/shop?destination=${encodeURIComponent(destination.name)}`}
                >
                  View {destination.name} Essentials
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Categories() {
  return (
    <section className="border-y border-white/10 bg-[#101010] px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-serif text-4xl text-white">Essential Categories</h2>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {categories.map(({ filter, icon: Icon, name }) => (
            <Link
              className="group flex min-h-32 flex-col justify-between border border-white/10 bg-white/[0.035] p-4 text-left transition-colors hover:border-white/30 hover:bg-white/[0.07]"
              href={`/shop?category=${encodeURIComponent(filter)}`}
              key={name}
            >
              <Icon className="h-6 w-6 text-[#d8b7aa]" strokeWidth={1.5} />
              <span className="text-sm font-semibold text-white/78 group-hover:text-white">
                {name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeforeYouFly({
  checkedItems,
  onToggle,
}: {
  checkedItems: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <section className="px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.36fr_0.64fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/46">
            Before You Fly
          </p>
          <h2 className="mt-4 font-serif text-5xl text-white">
            Last calm check before departure.
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {checklistItems.map((item) => {
            const checked = checkedItems.includes(item);

            return (
              <button
                className={
                  checked
                    ? "flex items-center gap-4 border border-[#d8b7aa]/40 bg-[#d8b7aa]/12 p-4 text-left text-white"
                    : "flex items-center gap-4 border border-white/10 bg-[#111] p-4 text-left text-white/62 transition-colors hover:border-white/26 hover:text-white"
                }
                key={item}
                onClick={() => onToggle(item)}
                type="button"
              >
                <span
                  className={
                    checked
                      ? "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#d8b7aa] text-[#050505]"
                      : "h-6 w-6 shrink-0 rounded-full border border-white/20"
                  }
                >
                  {checked ? <Check className="h-4 w-4" /> : null}
                </span>
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CuratedEssentials() {
  return (
    <section className="px-5 pb-16 sm:px-8 lg:pb-24" id="curated-essentials">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/46">
              Curated Essentials
            </p>
            <h2 className="mt-3 font-serif text-5xl text-white">
              Useful, compact, ready for the road.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/60">
            Save useful items to your essentials bag while you plan. Checkout
            and payment are not connected for this MVP.
          </p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {curatedEssentials.map((item) => (
            <article
              className="group overflow-hidden border border-white/10 bg-[#111]"
              key={item.slug}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  alt={item.imageAlt}
                  className="object-cover transition duration-700 group-hover:scale-105"
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  src={item.image}
                />
              </div>
              <div className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8b7aa]">
                  {item.category}
                </p>
                <h3 className="mt-3 font-serif text-2xl leading-tight text-white">
                  {item.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/58">
                  {item.description}
                </p>
                <Link
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/62 transition-colors group-hover:text-white"
                  href={`/shop/${item.slug}`}
                >
                  View Essential
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalKnowledge() {
  return (
    <section className="px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 border border-[#d8b7aa]/18 bg-[#2a211d] p-7 sm:p-10 lg:grid-cols-[0.42fr_0.58fr] lg:p-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d8b7aa]">
            Local Knowledge
          </p>
          <h2 className="mt-4 font-serif text-5xl leading-tight text-white">
            A little local knowledge goes a long way.
          </h2>
        </div>
        <div className="self-end">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/50">
            Heading to Japan?
          </p>
          <p className="mt-4 text-lg leading-8 text-white/72">
            Many smaller restaurants and local businesses may still prefer
            cash, so carrying some yen can be useful.
          </p>
          <Link
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            href="/vibe"
          >
            More destination tips
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function LeavingTomorrow() {
  return (
    <section className="px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl border border-white/10 bg-[#151515] p-7 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d8b7aa]">
              Travel Problems We Solve
            </p>
            <h2 className="mt-3 font-serif text-5xl text-white">
              Choose essentials by the friction they remove.
            </h2>
          </div>
          <Plane className="h-10 w-10 text-white/30" strokeWidth={1.4} />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {travelProblemItems.map(({ icon: Icon, problem, solution }) => (
            <article
              className="flex min-h-56 flex-col border border-white/10 bg-black/24 p-5"
              key={problem}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8b7aa]">
                  Problem
                </p>
                <Icon className="h-5 w-5 text-[#d8b7aa]" strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 font-serif text-3xl leading-tight text-white">
                {problem}
              </h3>
              <p className="mt-4 text-sm leading-6 text-white/58">
                {solution}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 border-t border-white/10 pt-10 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/46">
            Ready for the journey?
          </p>
          <h2 className="mt-3 font-serif text-5xl text-white">
            Explore your destination, find your essentials, and travel prepared.
          </h2>
        </div>
        <Link
          className="inline-flex h-12 shrink-0 items-center gap-3 bg-[#f8f4ea] px-6 text-sm font-semibold text-[#050505] transition-colors hover:bg-white"
          href="/explore"
        >
          <MapPin className="h-4 w-4" />
          Explore Your Destination
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
