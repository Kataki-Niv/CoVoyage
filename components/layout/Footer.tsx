import Link from "next/link";
import { ArrowUp, Mail, Send } from "lucide-react";

const footerColumns = [
  {
    title: "About",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Features", href: "/" },
      { label: "Journals", href: "/journal" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "FAQs", href: "/#faq" },
      { label: "Explore", href: "/explore" },
      { label: "Essentials", href: "/shop" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Call Center", href: "mailto:hello@covoyage.com" },
      { label: "Support Center", href: "mailto:hello@covoyage.com" },
      { label: "Contact Us", href: "mailto:hello@covoyage.com" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Privacy Policy", href: "/#faq" },
      { label: "Terms & Services", href: "/#faq" },
      { label: "Payments", href: "/shop" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#151515] px-8 pb-10 pt-28 text-white sm:px-12 lg:px-16 lg:pt-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)] lg:gap-16">
          <div>
            <p className="font-serif text-4xl font-semibold text-white">
              CoVoyage
            </p>
            <p className="mt-7 max-w-xs text-lg leading-8 text-white/62">
              Travel with your people and discover the world with more meaning.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-xl font-semibold text-white">{column.title}</h2>
              <div className="mt-8 grid gap-5">
                {column.links.map((link) => (
                  <Link
                    className="w-fit text-base font-medium text-white/58 transition duration-300 hover:text-white"
                    href={link.href}
                    key={link.label}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-32 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-white/52">
            ÂCopyright CoVoyage. All rights reserved
          </p>

          <div className="flex items-center gap-8 text-white/62">
            <Link
              aria-label="Facebook"
              className="transition duration-300 hover:text-white"
              href="#"
            >
              <span className="text-2xl font-semibold leading-none">f</span>
            </Link>
            <Link
              aria-label="Instagram"
              className="transition duration-300 hover:text-white"
              href="#"
            >
              <span className="text-xl font-semibold leading-none">ig</span>
            </Link>
            <Link
              aria-label="Twitter"
              className="transition duration-300 hover:text-white"
              href="#"
            >
              <span className="text-xl font-semibold leading-none">x</span>
            </Link>
            <Link
              aria-label="Email"
              className="transition duration-300 hover:text-white"
              href="mailto:hello@covoyage.com"
            >
              <Mail className="h-6 w-6" strokeWidth={1.8} />
            </Link>
            <Link
              aria-label="Community updates"
              className="transition duration-300 hover:text-white"
              href="#"
            >
              <Send className="h-6 w-6" strokeWidth={1.8} />
            </Link>
            <Link
              aria-label="Back to top"
              className="grid h-12 w-12 place-items-center bg-white/10 text-white transition duration-300 hover:bg-white hover:text-black"
              href="#"
            >
              <ArrowUp className="h-6 w-6" strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

