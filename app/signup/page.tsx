"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/shared/ContentCard";
import { FormField } from "@/components/shared/FormField";
import { PageShell } from "@/components/shared/PageShell";
import { ApiError, apiRequest, loginUser, storeAuth } from "@/lib/api";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <PageShell
      description="Create your CoVoyage profile and prepare for shared journeys with compatible travelers."
      eyebrow="Begin the journey"
      title="Create Account"
    >
      <section className="mx-auto max-w-2xl px-5 pb-20 sm:px-8">
        <ContentCard>
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
            {error ? (
              <p className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">
                {error}
              </p>
            ) : null}
            <FormField
              label="Name"
              name="name"
              placeholder="Maya Chen"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <FormField
              label="Username"
              name="username"
              placeholder="maya.travels"
              value={formData.username}
              onChange={handleChange}
            />
            <FormField
              className="sm:col-span-2"
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <FormField
              label="Password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <Button className="sm:col-span-2" disabled={isSubmitting} size="lg" type="submit">
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link className="font-medium text-stone-900 underline-offset-4 hover:underline" href="/login">
              Login
            </Link>
          </p>
        </ContentCard>
      </section>
    </PageShell>
  );
}
