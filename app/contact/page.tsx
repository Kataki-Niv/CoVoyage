"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Mail } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

type ContactFormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialFormState: ContactFormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormState>(initialFormState);
  const [successMessage, setSuccessMessage] = useState("");

  const updateField =
    (field: keyof ContactFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setSuccessMessage("");
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    setForm(initialFormState);
    setSuccessMessage("Thanks for reaching out! We'll get back to you soon.");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f8f4ea]">
      <Navbar />
      <main className="overflow-hidden bg-[#050505]">
        <section className="px-5 pb-8 pt-12 sm:px-8 lg:px-16 lg:pb-10 lg:pt-16">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/45">
              Contact CoVoyage
            </p>
            <h1 className="mt-5 text-4xl font-semibold uppercase leading-[0.98] tracking-[0.12em] text-white sm:text-5xl lg:text-6xl">
              Let&apos;s Talk
            </h1>
            <p className="mx-auto mt-5 max-w-2xl font-serif text-xl leading-tight text-white/72 sm:text-2xl">
              Have a question, suggestion, or just want to tell us about your
              journey?
            </p>
          </div>
        </section>

        <section className="px-5 pb-24 sm:px-8 lg:px-16 lg:pb-32">
          <div className="mx-auto grid max-w-7xl gap-10 border-y border-white/10 py-12 lg:grid-cols-[0.42fr_0.58fr] lg:gap-16 lg:py-16">
            <div className="flex flex-col justify-between gap-12">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/42">
                  Get in touch
                </p>
                <h2 className="mt-5 font-serif text-4xl leading-tight text-white sm:text-5xl">
                  We&apos;d love to hear from you.
                </h2>
                <a
                  className="mt-8 inline-flex items-center gap-3 border border-white/18 bg-white/10 px-5 py-4 text-sm font-semibold text-white transition duration-300 hover:border-white/34 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                  href="mailto:hello@covoyage.com"
                >
                  <Mail className="h-4 w-4" strokeWidth={1.6} />
                  hello@covoyage.com
                </a>
              </div>

              <p className="max-w-sm font-serif text-2xl leading-tight text-white/70">
                Every great journey starts with a conversation.
              </p>
            </div>

            <form
              className="border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 sm:p-8"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-white/82">
                  Name
                  <input
                    className="border border-white/14 bg-black/28 px-4 py-3 text-base text-white outline-none transition duration-200 placeholder:text-white/28 focus:border-white/42 focus:ring-2 focus:ring-white/18"
                    name="name"
                    onChange={updateField("name")}
                    required
                    type="text"
                    value={form.name}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-white/82">
                  Email
                  <input
                    className="border border-white/14 bg-black/28 px-4 py-3 text-base text-white outline-none transition duration-200 placeholder:text-white/28 focus:border-white/42 focus:ring-2 focus:ring-white/18"
                    name="email"
                    onChange={updateField("email")}
                    required
                    type="email"
                    value={form.email}
                  />
                </label>
              </div>

              <label className="mt-5 grid gap-2 text-sm font-medium text-white/82">
                Subject
                <input
                  className="border border-white/14 bg-black/28 px-4 py-3 text-base text-white outline-none transition duration-200 placeholder:text-white/28 focus:border-white/42 focus:ring-2 focus:ring-white/18"
                  name="subject"
                  onChange={updateField("subject")}
                  required
                  type="text"
                  value={form.subject}
                />
              </label>

              <label className="mt-5 grid gap-2 text-sm font-medium text-white/82">
                Message
                <textarea
                  className="min-h-40 resize-y border border-white/14 bg-black/28 px-4 py-3 text-base leading-7 text-white outline-none transition duration-200 placeholder:text-white/28 focus:border-white/42 focus:ring-2 focus:ring-white/18"
                  name="message"
                  onChange={updateField("message")}
                  required
                  value={form.message}
                />
              </label>

              <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  className="inline-flex w-fit items-center justify-center gap-3 border border-[#f8f4ea]/70 bg-[#f8f4ea] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#050505] transition duration-300 hover:border-white hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                  type="submit"
                >
                  Send Message
                  <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                </button>

                {successMessage ? (
                  <p className="text-sm leading-6 text-white/64" role="status">
                    {successMessage}
                  </p>
                ) : null}
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
