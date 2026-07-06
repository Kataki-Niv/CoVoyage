"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/shared/ContentCard";
import { FormField } from "@/components/shared/FormField";
import { PageShell } from "@/components/shared/PageShell";
import { ApiError, LoginResponse, apiRequest, storeAuth } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      const loginResponse = await apiRequest<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });

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
    <PageShell
      description="Return to your travel journal, companion matches, and local planning notes."
      eyebrow="Welcome back"
      title="Login"
    >
      <section className="mx-auto max-w-xl px-5 pb-20 sm:px-8">
        <ContentCard>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error ? (
              <p className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <FormField
              label="Email"
              name="email"
              placeholder="you@example.com"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <FormField
              label="Password"
              name="password"
              placeholder="Enter your password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-stone-600">
            Don&apos;t have an account?{" "}
            <Link className="font-medium text-stone-900 underline-offset-4 hover:underline" href="/signup">
              Sign Up
            </Link>
          </p>
        </ContentCard>
      </section>
    </PageShell>
  );
}
