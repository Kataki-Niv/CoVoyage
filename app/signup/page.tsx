"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

const SIGNUP_SUCCESS_TOAST =
  "🎉 Welcome to CoVoyage! Your account has been created successfully.";
const TOAST_STORAGE_KEY = "covoyage_toast";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest<{ message: string }>("/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginResponse = await loginUser(formData);

      storeAuth(loginResponse);
      window.sessionStorage.setItem(TOAST_STORAGE_KEY, SIGNUP_SUCCESS_TOAST);
      router.push("/");
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Registration failed.",
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
        <section className="w-full max-w-2xl">
          <div className="mb-6 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.34em] text-white/45">
              Begin The Journey
            </p>
            <h1 className="mt-3 font-serif text-5xl leading-none text-white">
              Create Account
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/58">
              Create your CoVoyage profile and prepare for shared journeys with
              compatible travelers.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30 sm:p-6">
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            {isCheckingSession ? (
              <p className="text-sm text-white/58 sm:col-span-2">
                Checking saved session...
              </p>
            ) : null}
            {error ? (
              <p className="border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-100 sm:col-span-2">
                {error}
              </p>
            ) : null}
            <label className="block text-sm font-medium text-white/72">
              Name
              <input
                className="mt-2 h-11 w-full border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-white/32 focus:ring-2 focus:ring-white/10"
                name="name"
                placeholder="Maya Chen"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </label>
            <label className="block text-sm font-medium text-white/72">
              Username
              <input
                className="mt-2 h-11 w-full border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-white/32 focus:ring-2 focus:ring-white/10"
                name="username"
                placeholder="maya.travels"
                required
                value={formData.username}
                onChange={handleChange}
              />
            </label>
            <label className="block text-sm font-medium text-white/72 sm:col-span-2">
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
                placeholder="Create a password"
                required
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </label>
            <label className="block text-sm font-medium text-white/72">
              Confirm Password
              <input
                className="mt-2 h-11 w-full border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-white/32 focus:ring-2 focus:ring-white/10"
                name="confirmPassword"
                placeholder="Confirm password"
                required
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </label>
            <Button
              className="h-11 w-full rounded-none bg-[#f8f4ea] text-black shadow-sm shadow-white/10 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-white/10 focus-visible:ring-white/40 focus-visible:ring-offset-[#050505] sm:col-span-2"
              disabled={isCheckingSession || isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-white/58">
            Already have an account?{" "}
            <Link className="font-medium text-white underline-offset-4 hover:underline" href="/login">
              Login
            </Link>
          </p>
          </div>
        </section>
      </main>
    </div>
  );
}
