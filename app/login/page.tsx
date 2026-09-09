"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  AuthSessionResponse,
  apiRequest,
  getValidAuthToken,
  loginUser,
  storeAuth,
} from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const redirectAuthenticatedUser = async () => {
      const token = getValidAuthToken();

      if (!token) {
        if (isMounted) {
          setIsCheckingSession(false);
        }
        return;
      }

      try {
        await apiRequest<AuthSessionResponse>("/auth/session", { token });
        router.replace("/profile");
      } catch {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    };

    redirectAuthenticatedUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const loginResponse = await loginUser(formData);

      storeAuth(loginResponse);
      router.push("/profile");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError ? caughtError.detail : "Login failed.",
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
      <main className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center px-5 py-3 sm:px-8">
        <section className="w-full max-w-md">
          <div className="mb-5 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/45">
              Welcome Back
            </p>
            <h1 className="mt-3 font-serif text-5xl leading-none text-white">
              Login
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/58">
              Return to your travel journal, companion matches, and local
              planning notes.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/30">
            <form className="space-y-3.5" onSubmit={handleSubmit}>
            {isCheckingSession ? (
              <p className="text-sm text-white/58">Checking saved session...</p>
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
                value={formData.email}
                onChange={handleChange}
              />
            </label>
            <label className="block text-sm font-medium text-white/72">
              Password
              <input
                className="mt-2 h-11 w-full border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-white/32 focus:ring-2 focus:ring-white/10"
                name="password"
                placeholder="Enter your password"
                required
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </label>
            <div className="text-right">
              <Link
                className="text-sm font-medium text-white/72 underline-offset-4 hover:text-white hover:underline"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              className="h-11 w-full rounded-none bg-[#f8f4ea] text-black shadow-sm shadow-white/10 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-white/10 focus-visible:ring-white/40 focus-visible:ring-offset-[#050505]"
              disabled={isCheckingSession || isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="mt-3 text-center text-sm text-white/58">
            Don&apos;t have an account?{" "}
            <Link className="font-medium text-white underline-offset-4 hover:underline" href="/signup">
              Sign Up
            </Link>
          </p>
          <p className="mt-2 text-center text-[0.62rem] font-medium uppercase tracking-[0.26em] text-white/30">
            Your Journey &bull; Your People &bull; Your Place
          </p>
          </div>
        </section>
      </main>
    </div>
  );
}
