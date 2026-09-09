"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ApiError, confirmEmailVerification } from "@/lib/api";

function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    let isMounted = true;

    const verifyEmail = async () => {
      if (!token) {
        setError("Email verification token is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await confirmEmailVerification(token);

        if (isMounted) {
          setMessage(response.message);
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.detail
              : "Unable to verify email.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <p className="text-sm text-white/58">Verifying email...</p>
      ) : null}
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
      <Button
        asChild
        className="h-11 w-full rounded-none bg-[#f8f4ea] text-black shadow-sm shadow-white/10 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-white/10 focus-visible:ring-white/40 focus-visible:ring-offset-[#050505]"
      >
        <Link href="/profile">Open Profile</Link>
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f8f4ea]">
      <div className="pointer-events-none absolute inset-0 bg-[url('/covoyage-hero-tree.jpg')] bg-cover bg-center opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-0 bg-[#050505]/88" />
      <Navbar />
      <main className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center px-5 py-8 sm:px-8">
        <section className="w-full max-w-md">
          <div className="mb-5 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/45">
              Account Email
            </p>
            <h1 className="mt-3 font-serif text-5xl leading-none text-white">
              Verify Email
            </h1>
          </div>

          <div className="border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30">
            <Suspense
              fallback={<p className="text-sm text-white/58">Loading verification...</p>}
            >
              <VerifyEmailStatus />
            </Suspense>
          </div>
        </section>
      </main>
    </div>
  );
}
