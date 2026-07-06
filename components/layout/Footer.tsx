import Link from "next/link";
import { Camera, Mail, Send } from "lucide-react";

const footerLinks = [
  { label: "About", href: "/#community" },
  { label: "Contact", href: "mailto:hello@covoyage.com" },
  { label: "Privacy", href: "/#faq" },
  { label: "Terms", href: "/#faq" },
];

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-[#f4eee4] px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-serif text-3xl text-stone-900">CoVoyage</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">
            Shared journeys, local insight, and thoughtful travel stories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          {footerLinks.map((link) => (
            <Link
              className="text-xs font-medium uppercase tracking-[0.22em] text-stone-600 hover:text-stone-950"
              href={link.href}
              key={link.label}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3 text-stone-600">
          <Link aria-label="Travel gallery" href="#">
            <Camera className="h-5 w-5" />
          </Link>
          <Link aria-label="Email" href="mailto:hello@covoyage.com">
            <Mail className="h-5 w-5" />
          </Link>
          <Link aria-label="Community updates" href="#">
            <Send className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
