"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ApiError, confirmPasswordReset } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState(token ? "" : "Password reset token is missing.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
    setError(token ? "" : "Password reset token is missing.");
    setMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("Password reset token is missing.");
      return;
    }

    if (formData.new_password.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError("New password and confirmation must match.");
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await confirmPasswordReset({
        token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });
      setMessage(response.message);
      setFormData({
        new_password: "",
        confirm_password: "",
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to reset password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
        New Password
        <input
          className="mt-2 h-11 w-full border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-white/32 focus:ring-2 focus:ring-white/10"
          name="new_password"
          placeholder="Create a new password"
          required
          type="password"
          value={formData.new_password}
          onChange={handleChange}
        />
      </label>
      <label className="block text-sm font-medium text-white/72">
        Confirm Password
        <input
          className="mt-2 h-11 w-full border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-white/32 focus:ring-2 focus:ring-white/10"
          name="confirm_password"
          placeholder="Confirm your new password"
          required
          type="password"
          value={formData.confirm_password}
          onChange={handleChange}
        />
      </label>
      <Button
        className="h-11 w-full rounded-none bg-[#f8f4ea] text-black shadow-sm shadow-white/10 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-white/10 focus-visible:ring-white/40 focus-visible:ring-offset-[#050505]"
        disabled={isSubmitting || !token}
        type="submit"
      >
        {isSubmitting ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
              New Password
            </h1>
          </div>

          <div className="border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30">
            <Suspense
              fallback={<p className="text-sm text-white/58">Loading reset...</p>}
            >
              <ResetPasswordForm />
            </Suspense>
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
