"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

type CommunityTipSubmissionProps = {
  placeName: string;
};

type EventSubmissionProps = {
  country: string;
};

export function CommunityTipSubmission({
  placeName,
}: CommunityTipSubmissionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const close = () => {
    setIsOpen(false);
    setIsSubmitted(false);
  };

  return (
    <>
      <button
        className="inline-flex border border-[#b99686] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#7d584e] transition-colors hover:bg-[#efe1d8]"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Share a Community Tip
      </button>
      {isOpen ? (
        <SubmissionModal
          title={`Share a ${placeName} Tip`}
          onClose={close}
          submittedMessage="Thanks — your tip has been submitted for review."
        >
          {isSubmitted ? null : (
            <form className="space-y-4">
              <PrototypeInput label="Name" placeholder="Your name" />
              <PrototypeTextarea label="Your tip" placeholder="Share a practical local note..." />
              <PrototypeInput label="Optional rating" placeholder="4.8" />
              <button
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#7d584e] text-xs font-medium uppercase tracking-[0.16em] text-[#fffaf3]"
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

export function EventSubmission({ country }: EventSubmissionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const close = () => {
    setIsOpen(false);
    setIsSubmitted(false);
  };

  return (
    <>
      <button
        className="inline-flex rounded-full border border-[#7d584e] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#5a3b2d] transition-colors hover:bg-[#ead7bd]"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Share an Event
      </button>
      {isOpen ? (
        <SubmissionModal
          title={`Share a ${country} Event`}
          onClose={close}
          submittedMessage="Thanks — your event has been submitted for review."
        >
          {isSubmitted ? null : (
            <form className="space-y-4">
              <PrototypeInput label="Event name" placeholder="Event name" />
              <PrototypeInput label="Location" placeholder="City or region" />
              <PrototypeInput label="Date" placeholder="Month or date" />
              <PrototypeInput label="Category" placeholder="Culture, nature, festival..." />
              <PrototypeTextarea label="Short description" placeholder="What should travelers know?" />
              <button
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#7d584e] text-xs font-medium uppercase tracking-[0.16em] text-[#fffaf3]"
                onClick={() => setIsSubmitted(true)}
                type="button"
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
}: {
  children: ReactNode;
  onClose: () => void;
  submittedMessage: string;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#3f342f]/18 px-4 backdrop-blur-[1px]">
      <section
        aria-label={title}
        className="w-full max-w-md border border-[#d8b7aa] bg-[#fffaf3] p-4 shadow-2xl shadow-[#4e3f39]/25"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#eadbd2] pb-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#a16f61]">
              Frontend Prototype
            </p>
            <h2 className="mt-1 font-serif text-2xl leading-tight text-[#443733]">
              {title}
            </h2>
          </div>
          <button
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#d8b7aa] text-[#6f5b53] transition-colors hover:bg-[#efe1d8]"
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
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <label className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[#8d6255]">
      {label}
      <input
        className="mt-2 h-11 w-full border border-[#d8b7aa] bg-[#fbf8f2] px-3 text-sm text-[#4f413c] outline-none placeholder:text-[#a89288]"
        placeholder={placeholder}
        type="text"
      />
    </label>
  );
}

function PrototypeTextarea({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <label className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[#8d6255]">
      {label}
      <textarea
        className="mt-2 min-h-28 w-full resize-none border border-[#d8b7aa] bg-[#fbf8f2] p-3 text-sm text-[#4f413c] outline-none placeholder:text-[#a89288]"
        placeholder={placeholder}
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
