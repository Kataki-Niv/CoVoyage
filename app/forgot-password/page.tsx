"use client";

import Link from "next/link";
import { useState } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ApiError, requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset(email);
      setMessage(response.message);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to prepare password reset.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f8f4ea]">
      <div className="pointer-events-none absolute inset-0 bg-[url('/covoyage-hero-tree.jpg')] bg-cover bg-center opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 bg-[#050505]/88" />
      <Navbar />
      <main className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center px-5 py-8 sm:px-8">
        <section className="w-full max-w-md">
          <div className="mb-5 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/45">
              Account Recovery
            </p>
            <h1 className="mt-3 font-serif text-5xl leading-none text-white">
              Reset Password
            </h1>
          </div>

          <div className="border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {message ? (
                <p className="border border-green-400/30 bg-green-950/30 px-4 py-3 text-sm text-green-100">
                  {message}
                </p>
              ) : null}
              {error ? (
                <p className="border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100">
                  {error}
                </p>
              ) : null}
              <label className="block text-sm font-medium text-white/72">
                Email
                <input
                  className="mt-2 h-11 w-full border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-white/32 focus:ring-2 focus:ring-white/10"
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <Button
                className="h-11 w-full rounded-none bg-[#f8f4ea] text-black shadow-sm shadow-white/10 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-white/10 focus-visible:ring-white/40 focus-visible:ring-offset-[#050505]"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Preparing..." : "Prepare Reset"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-white/58">
              <Link
                className="font-medium text-white underline-offset-4 hover:underline"
                href="/login"
              >
                Back to login
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
