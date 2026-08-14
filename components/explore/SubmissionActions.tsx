"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { FormEvent, useState } from "react";

import {
  createDestinationEvent,
  type DestinationEventResponse,
} from "@/lib/eventsApi";

type CommunityTipSubmissionProps = {
  placeName: string;
  variant?: "light" | "dark";
};

type EventSubmissionProps = {
  country: string;
  countrySlug?: string;
  onEventCreated?: (event: DestinationEventResponse) => void;
  variant?: "light" | "dark";
};

export function CommunityTipSubmission({
  placeName,
  variant = "light",
}: CommunityTipSubmissionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isDark = variant === "dark";

  const close = () => {
    setIsOpen(false);
    setIsSubmitted(false);
  };

  return (
    <>
      <button
        className={
          isDark
            ? "inline-flex border border-[#D8BE8A]/36 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#D8BE8A] transition-colors hover:bg-[#D8BE8A] hover:text-[#0B0B0C]"
            : "inline-flex border border-[#b99686] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#7d584e] transition-colors hover:bg-[#efe1d8]"
        }
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Share a Community Tip
      </button>
      {isOpen ? (
        <SubmissionModal
          title={`Share a ${placeName} Tip`}
          onClose={close}
          variant={variant}
          submittedMessage="Thanks — your tip has been submitted for review."
        >
          {isSubmitted ? null : (
            <form className="space-y-4">
              <PrototypeInput label="Name" placeholder="Your name" variant={variant} />
              <PrototypeTextarea
                label="Your tip"
                placeholder="Share a practical local note..."
                variant={variant}
              />
              <PrototypeInput
                label="Optional rating"
                placeholder="4.8"
                variant={variant}
              />
              <button
                className={
                  isDark
                    ? "inline-flex h-11 w-full items-center justify-center rounded-full bg-[#D8BE8A] text-xs font-medium uppercase tracking-[0.16em] text-[#0B0B0C]"
                    : "inline-flex h-11 w-full items-center justify-center rounded-full bg-[#7d584e] text-xs font-medium uppercase tracking-[0.16em] text-[#fffaf3]"
                }
                onClick={() => setIsSubmitted(true)}
                type="button"
              >
                Post Tip
              </button>
            </form>
          )}
          {isSubmitted ? (
            <Confirmation message="Thanks — your tip has been submitted for review." />
          ) : null}
        </SubmissionModal>
      ) : null}
    </>
  );
}

export function EventSubmission({
  country,
  countrySlug,
  onEventCreated,
  variant = "light",
}: EventSubmissionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [eventDraft, setEventDraft] = useState({
    category: "",
    date: "",
    description: "",
    location: "",
    title: "",
  });
  const isDark = variant === "dark";

  const close = () => {
    setIsOpen(false);
    setIsSubmitted(false);
    setErrorMessage(null);
    setEventDraft({
      category: "",
      date: "",
      description: "",
      location: "",
      title: "",
    });
  };

  const handleEventSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!countrySlug) {
      setIsSubmitted(true);
      return;
    }

    try {
      const createdEvent = await createDestinationEvent({
        title: eventDraft.title,
        category: eventDraft.category,
        country_slug: countrySlug,
        date_start: eventDraft.date,
        location: eventDraft.location,
        description: eventDraft.description,
      });

      onEventCreated?.(createdEvent);
      setIsSubmitted(true);
      setErrorMessage(null);
    } catch {
      setErrorMessage("Your event could not be shared. Please try again.");
    }
  };

  return (
    <>
      <button
        className={
          isDark
            ? "inline-flex rounded-full border border-[#D8BE8A]/36 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#D8BE8A] transition-colors hover:bg-[#D8BE8A] hover:text-[#0B0B0C]"
            : "inline-flex rounded-full border border-[#7d584e] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#5a3b2d] transition-colors hover:bg-[#ead7bd]"
        }
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Share an Event
      </button>
      {isOpen ? (
        <SubmissionModal
          title={`Share a ${country} Event`}
          onClose={close}
          variant={variant}
          submittedMessage="Thanks — your event has been submitted for review."
        >
          {isSubmitted ? null : (
            <form className="space-y-4" onSubmit={handleEventSubmit}>
              <PrototypeInput
                label="Event name"
                onChange={(value) =>
                  setEventDraft((currentDraft) => ({
                    ...currentDraft,
                    title: value,
                  }))
                }
                placeholder="Event name"
                required={Boolean(countrySlug)}
                value={eventDraft.title}
                variant={variant}
              />
              <PrototypeInput
                label="Location"
                onChange={(value) =>
                  setEventDraft((currentDraft) => ({
                    ...currentDraft,
                    location: value,
                  }))
                }
                placeholder="City or region"
                required={Boolean(countrySlug)}
                value={eventDraft.location}
                variant={variant}
              />
              <PrototypeInput
                label="Date"
                onChange={(value) =>
                  setEventDraft((currentDraft) => ({
                    ...currentDraft,
                    date: value,
                  }))
                }
                placeholder="YYYY-MM-DD"
                required={Boolean(countrySlug)}
                type="date"
                value={eventDraft.date}
                variant={variant}
              />
              <PrototypeInput
                label="Category"
                onChange={(value) =>
                  setEventDraft((currentDraft) => ({
                    ...currentDraft,
                    category: value,
                  }))
                }
                placeholder="Culture, nature, festival..."
                required={Boolean(countrySlug)}
                value={eventDraft.category}
                variant={variant}
              />
              <PrototypeTextarea
                label="Short description"
                onChange={(value) =>
                  setEventDraft((currentDraft) => ({
                    ...currentDraft,
                    description: value,
                  }))
                }
                placeholder="What should travelers know?"
                required={Boolean(countrySlug)}
                value={eventDraft.description}
                variant={variant}
              />
              {errorMessage ? (
                <p
                  className={
                    isDark
                      ? "text-sm text-[#D8BE8A]"
                      : "text-sm text-[#8d6255]"
                  }
                >
                  {errorMessage}
                </p>
              ) : null}
              <button
                className={
                  isDark
                    ? "inline-flex h-11 w-full items-center justify-center rounded-full bg-[#D8BE8A] text-xs font-medium uppercase tracking-[0.16em] text-[#0B0B0C]"
                    : "inline-flex h-11 w-full items-center justify-center rounded-full bg-[#7d584e] text-xs font-medium uppercase tracking-[0.16em] text-[#fffaf3]"
                }
                type="submit"
              >
                Post Event
              </button>
            </form>
          )}
          {isSubmitted ? (
            <Confirmation message="Thanks — your event has been submitted for review." />
          ) : null}
        </SubmissionModal>
      ) : null}
    </>
  );
}

function SubmissionModal({
  children,
  onClose,
  submittedMessage,
  title,
  variant = "light",
}: {
  children: ReactNode;
  onClose: () => void;
  submittedMessage: string;
  title: string;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";

  return (
    <div
      className={
        isDark
          ? "fixed inset-0 z-[70] grid place-items-center bg-black/48 px-4 backdrop-blur-[2px]"
          : "fixed inset-0 z-[70] grid place-items-center bg-[#3f342f]/18 px-4 backdrop-blur-[1px]"
      }
    >
      <section
        aria-label={title}
        className={
          isDark
            ? "w-full max-w-md border border-[#D8BE8A]/24 bg-[#111112] p-4 shadow-2xl shadow-black/40"
            : "w-full max-w-md border border-[#d8b7aa] bg-[#fffaf3] p-4 shadow-2xl shadow-[#4e3f39]/25"
        }
      >
        <div
          className={
            isDark
              ? "flex items-start justify-between gap-4 border-b border-white/10 pb-4"
              : "flex items-start justify-between gap-4 border-b border-[#eadbd2] pb-4"
          }
        >
          <div>
            <p
              className={
                isDark
                  ? "text-[10px] font-medium uppercase tracking-[0.18em] text-[#D8BE8A]"
                  : "text-[10px] font-medium uppercase tracking-[0.18em] text-[#a16f61]"
              }
            >
              Frontend Prototype
            </p>
            <h2
              className={
                isDark
                  ? "mt-1 font-serif text-2xl leading-tight text-[#F5F1E8]"
                  : "mt-1 font-serif text-2xl leading-tight text-[#443733]"
              }
            >
              {title}
            </h2>
          </div>
          <button
            aria-label="Close"
            className={
              isDark
                ? "grid h-9 w-9 place-items-center rounded-full border border-[#D8BE8A]/24 text-[#D8BE8A] transition-colors hover:bg-[#D8BE8A] hover:text-[#0B0B0C]"
                : "grid h-9 w-9 place-items-center rounded-full border border-[#d8b7aa] text-[#6f5b53] transition-colors hover:bg-[#efe1d8]"
            }
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="pt-5">{children}</div>
        <p className="sr-only">{submittedMessage}</p>
      </section>
    </div>
  );
}

function PrototypeInput({
  label,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
  variant = "light",
}: {
  label: string;
  onChange?: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  value?: string;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";

  return (
    <label
      className={
        isDark
          ? "block text-[10px] font-medium uppercase tracking-[0.18em] text-[#D8BE8A]/80"
          : "block text-[10px] font-medium uppercase tracking-[0.18em] text-[#8d6255]"
      }
    >
      {label}
      <input
        className={
          isDark
            ? "mt-2 h-11 w-full border border-white/10 bg-[#0B0B0C] px-3 text-sm text-[#F5F1E8] outline-none placeholder:text-[#9E9589] focus:border-[#D8BE8A]/45"
            : "mt-2 h-11 w-full border border-[#d8b7aa] bg-[#fbf8f2] px-3 text-sm text-[#4f413c] outline-none placeholder:text-[#a89288]"
        }
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function PrototypeTextarea({
  label,
  onChange,
  placeholder,
  required = false,
  value,
  variant = "light",
}: {
  label: string;
  onChange?: (value: string) => void;
  placeholder: string;
  required?: boolean;
  value?: string;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";

  return (
    <label
      className={
        isDark
          ? "block text-[10px] font-medium uppercase tracking-[0.18em] text-[#D8BE8A]/80"
          : "block text-[10px] font-medium uppercase tracking-[0.18em] text-[#8d6255]"
      }
    >
      {label}
      <textarea
        className={
          isDark
            ? "mt-2 min-h-28 w-full resize-none border border-white/10 bg-[#0B0B0C] p-3 text-sm text-[#F5F1E8] outline-none placeholder:text-[#9E9589] focus:border-[#D8BE8A]/45"
            : "mt-2 min-h-28 w-full resize-none border border-[#d8b7aa] bg-[#fbf8f2] p-3 text-sm text-[#4f413c] outline-none placeholder:text-[#a89288]"
        }
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
    </label>
  );
}

function Confirmation({ message }: { message: string }) {
  return (
    <div className="border border-[#d8b7aa] bg-[#f5ece4] px-4 py-5 text-sm leading-6 text-[#5f4d47]">
      {message}
    </div>
  );
}
