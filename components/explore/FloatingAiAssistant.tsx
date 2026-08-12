"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  MessageCircle,
  Plane,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";

type ItineraryField = {
  label: string;
  value: string;
};

type FloatingAiAssistantProps = {
  country: string;
  flag: string;
  itineraryFields?: ItineraryField[];
  variant?: "pill" | "icon";
};

type AssistantMode = "menu" | "itinerary" | "chat";

const baseSuggestedQuestions = [
  "Hidden gems",
  "Local etiquette",
  "Best route",
  "What should I pack?",
  "Summarize community tips",
];

export function FloatingAiAssistant({
  country,
  flag,
  itineraryFields = [],
  variant = "pill",
}: FloatingAiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AssistantMode>(
    variant === "icon" ? "menu" : "chat",
  );
  const displayFlag = country === "Japan" ? "\uD83C\uDDEF\uD83C\uDDF5" : flag;
  const isIconVariant = variant === "icon";
  const suggestedQuestions = [
    `What should I pack for ${country}?`,
    ...baseSuggestedQuestions,
  ];

  const openAssistant = () => {
    setMode(isIconVariant ? "menu" : "chat");
    setIsOpen(true);
  };

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-label="Ask CoVoyage AI"
        className={
          isIconVariant
            ? "fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full border border-[#d8b7aa] bg-[#fffaf3]/95 text-[#7d584e] shadow-2xl shadow-[#7d584e]/20 backdrop-blur transition-colors hover:bg-[#f5ece4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b6b5f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf8f2]"
            : "fixed bottom-6 right-6 z-50 inline-flex h-14 items-center gap-2.5 rounded-full border border-[#d8b7aa] bg-[#fffaf3]/95 px-5 text-sm font-medium text-[#3f342f] shadow-2xl shadow-[#7d584e]/20 backdrop-blur transition-colors hover:bg-[#f5ece4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b6b5f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf8f2]"
        }
        onClick={openAssistant}
        type="button"
      >
        <span
          className={
            isIconVariant
              ? "grid h-10 w-10 place-items-center rounded-full bg-[#efe1d8] text-[#7d584e]"
              : "grid h-8 w-8 place-items-center rounded-full bg-[#efe1d8] text-[#7d584e]"
          }
        >
          <Sparkles className="h-4 w-4" />
        </span>
        {isIconVariant ? (
          <span className="sr-only">Ask CoVoyage AI</span>
        ) : (
          "Ask CoVoyage AI"
        )}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-40 bg-[#3f342f]/10 backdrop-blur-[1px]"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              transition={{ duration: 0.2 }}
            />
            <motion.aside
              animate={{ opacity: 1, x: 0 }}
              aria-label="CoVoyage AI chat panel"
              className="fixed bottom-6 right-6 top-6 z-50 flex w-[calc(100vw-32px)] max-w-[410px] flex-col overflow-hidden rounded-[18px] border border-[#d8b7aa] bg-[#fffaf3] shadow-2xl shadow-[#4e3f39]/25 sm:right-6 sm:w-[410px]"
              exit={{ opacity: 0, x: 36 }}
              initial={{ opacity: 0, x: 52 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <header className="border-b border-[#eadbd2] bg-[#fbf4eb] px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#efe1d8] text-[#7d584e]">
                        <Bot className="h-4.5 w-4.5" />
                      </span>
                      <h2 className="font-serif text-2xl leading-none text-[#443733]">
                        CoVoyage AI
                      </h2>
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#a16f61]">
                        Currently exploring:
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#4f413c]">
                        <span className="mr-2" aria-hidden="true">
                          {displayFlag}
                        </span>
                        {country}
                      </p>
                    </div>
                  </div>
                  <button
                    aria-label="Close CoVoyage AI"
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#d8b7aa] text-[#6f5b53] transition-colors hover:bg-[#efe1d8]"
                    onClick={() => setIsOpen(false)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </header>

              {mode === "menu" ? (
                <AssistantMenu setMode={setMode} />
              ) : null}
              {mode === "itinerary" ? (
                <ItineraryFlow
                  country={country}
                  fields={itineraryFields}
                  setMode={setMode}
                />
              ) : null}
              {mode === "chat" ? (
                <ChatFlow
                  country={country}
                  setMode={setMode}
                  suggestedQuestions={suggestedQuestions}
                />
              ) : null}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function AssistantMenu({
  setMode,
}: {
  setMode: (mode: AssistantMode) => void;
}) {
  return (
    <div className="min-h-0 flex-1 px-5 py-5">
      <div className="space-y-3">
        <button
          className="flex w-full items-center gap-4 border border-[#d8b7aa] bg-[#fbf8f2] px-4 py-4 text-left transition-colors hover:bg-[#efe1d8]"
          onClick={() => setMode("itinerary")}
          type="button"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#efe1d8] text-[#7d584e]">
            <Plane className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-xs font-medium uppercase tracking-[0.2em] text-[#8d6255]">
              Create My Itinerary
            </span>
            <span className="mt-1 block text-sm text-[#6f5b53]">
              Budget, days, and interests.
            </span>
          </span>
        </button>
        <button
          className="flex w-full items-center gap-4 border border-[#d8b7aa] bg-[#fbf8f2] px-4 py-4 text-left transition-colors hover:bg-[#efe1d8]"
          onClick={() => setMode("chat")}
          type="button"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#efe1d8] text-[#7d584e]">
            <MessageCircle className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-xs font-medium uppercase tracking-[0.2em] text-[#8d6255]">
              Ask CoVoyage AI
            </span>
            <span className="mt-1 block text-sm text-[#6f5b53]">
              Ask destination-specific questions.
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

function ItineraryFlow({
  country,
  fields,
  setMode,
}: {
  country: string;
  fields: ItineraryField[];
  setMode: (mode: AssistantMode) => void;
}) {
  const fallbackFields = [
    { label: "Budget", value: "$1800" },
    { label: "Number of days", value: "7" },
    { label: "Interests", value: "Culture, food, nature" },
  ];
  const formFields = fields.length > 0 ? fields : fallbackFields;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
      <button
        aria-label="Back to CoVoyage AI options"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8b7aa] text-[#6f5b53] transition-colors hover:bg-[#efe1d8]"
        onClick={() => setMode("menu")}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <h3 className="mt-4 font-serif text-3xl leading-tight text-[#443733]">
        Create My {country} Itinerary
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#6f5b53]">
        Frontend mock form. Later this will send preferences to FastAPI and
        Gemini.
      </p>
      <form className="mt-5 space-y-4">
        {formFields.map((field) => (
          <label
            className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[#8d6255]"
            key={field.label}
          >
            {field.label === "Days" ? "Number of days" : field.label}
            <input
              className="mt-2 h-12 w-full border border-[#d8b7aa] bg-[#fffaf3] px-4 text-sm text-[#4f413c] outline-none placeholder:text-[#a89288]"
              defaultValue={field.value}
              type="text"
            />
          </label>
        ))}
        <button
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#7d584e] text-xs font-medium uppercase tracking-[0.16em] text-[#fffaf3]"
          type="button"
        >
          Create Itinerary
        </button>
      </form>
    </div>
  );
}

function ChatFlow({
  country,
  setMode,
  suggestedQuestions,
}: {
  country: string;
  setMode: (mode: AssistantMode) => void;
  suggestedQuestions: string[];
}) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <button
          aria-label="Back to CoVoyage AI options"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d8b7aa] text-[#6f5b53] transition-colors hover:bg-[#efe1d8]"
          onClick={() => setMode("menu")}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <section className="mt-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#9b6b5f]">
            Ask about {country}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                className="rounded-full border border-[#dfc9be] bg-[#fbf8f2] px-3 py-2 text-xs leading-none text-[#6f5b53] transition-colors hover:bg-[#efe1d8]"
                key={question}
                type="button"
              >
                {question}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <div className="max-w-[88%] rounded-[18px] rounded-tl-[6px] border border-[#eadbd2] bg-[#fbf8f2] px-4 py-3 shadow-sm shadow-[#b99686]/10">
            <p className="text-sm leading-6 text-[#5f4d47]">
              I already know you are exploring {country}. Ask me about packing,
              routes, local etiquette, events, or the curated places on this
              page.
            </p>
          </div>
          <div className="ml-auto max-w-[82%] rounded-[18px] rounded-br-[6px] bg-[#7d584e] px-4 py-3 text-[#fffaf3] shadow-lg shadow-[#7d584e]/15">
            <p className="text-sm leading-6">
              What should I plan first?
            </p>
          </div>
          <div className="max-w-[88%] rounded-[18px] rounded-tl-[6px] border border-[#eadbd2] bg-[#fbf8f2] px-4 py-3 shadow-sm shadow-[#b99686]/10">
            <p className="text-sm leading-6 text-[#5f4d47]">
              Start with the route and season constraints. This mock answer
              will later be replaced by a Gemini response grounded in the
              current destination data.
            </p>
          </div>
        </section>
      </div>

      <form className="border-t border-[#eadbd2] bg-[#fbf4eb] p-4">
        <div className="flex items-center gap-2 rounded-full border border-[#d8b7aa] bg-[#fffaf3] px-4 py-2 shadow-inner shadow-[#b99686]/10">
          <input
            aria-label={`Ask anything about ${country}`}
            className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[#3f342f] outline-none placeholder:text-[#9a8177]"
            placeholder={`Ask anything about ${country}...`}
            type="text"
          />
          <button
            aria-label="Send message"
            className="grid h-9 w-9 place-items-center rounded-full bg-[#332a26] text-[#fffaf3] transition-colors hover:bg-[#5c4038]"
            type="button"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </>
  );
}
