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

import {
  generateLocalVibeItinerary,
  sendLocalVibeDiscoveryChatMessage,
  sendLocalVibeChatMessage,
  type LocalVibeItineraryDay,
} from "@/lib/destinationApi";

type ItineraryField = {
  label: string;
  value: string;
};

type FloatingAiAssistantProps = {
  country: string;
  countrySlug?: string;
  flag?: string;
  itineraryFields?: ItineraryField[];
  selectedPlaceSlugs?: string[];
  variant?: "pill" | "icon";
};

type AssistantMode = "menu" | "itinerary" | "chat";
type AssistantResponseSource = "gemini" | "fallback";

type ChatMessage = {
  role: "assistant" | "user";
  body: string;
  source?: AssistantResponseSource;
};

const baseSuggestedQuestions = [
  "Hidden gems",
  "Local etiquette",
  "Best route",
  "What should I pack?",
  "Summarize community tips",
];

const genericSuggestedQuestions = [
  "Where should I go this month?",
  "Which trip is best for culture?",
  "Which destination is better for budget?",
  "Help me choose a travel style",
  "What should I compare first?",
];

const countryCodesBySlug: Record<string, string> = {
  argentina: "AR",
  canada: "CA",
  france: "FR",
  guatemala: "GT",
  iceland: "IS",
  india: "IN",
  indonesia: "ID",
  italy: "IT",
  japan: "JP",
  kenya: "KE",
  mexico: "MX",
  morocco: "MA",
  "new-zealand": "NZ",
  norway: "NO",
  peru: "PE",
  portugal: "PT",
  "south-africa": "ZA",
  spain: "ES",
  thailand: "TH",
  turkey: "TR",
  vietnam: "VN",
};

const countryCodesByName: Record<string, string> = {
  argentina: "AR",
  canada: "CA",
  france: "FR",
  guatemala: "GT",
  iceland: "IS",
  india: "IN",
  indonesia: "ID",
  italy: "IT",
  japan: "JP",
  kenya: "KE",
  mexico: "MX",
  morocco: "MA",
  "new zealand": "NZ",
  norway: "NO",
  peru: "PE",
  portugal: "PT",
  "south africa": "ZA",
  spain: "ES",
  thailand: "TH",
  turkey: "TR",
  vietnam: "VN",
};

function countryCodeToFlagEmoji(countryCode: string) {
  const normalizedCode = countryCode.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(normalizedCode)) {
    return "";
  }

  return String.fromCodePoint(
    ...normalizedCode
      .split("")
      .map((character) => 127397 + character.charCodeAt(0)),
  );
}

function getDisplayFlag({
  country,
  countrySlug,
  flag,
}: {
  country: string;
  countrySlug?: string;
  flag?: string;
}) {
  const slugCode = countrySlug ? countryCodesBySlug[countrySlug] : undefined;
  const nameCode = countryCodesByName[country.trim().toLowerCase()];
  const fallbackCode = flag && /^[A-Za-z]{2}$/.test(flag.trim()) ? flag : undefined;
  const countryCode = slugCode ?? nameCode ?? fallbackCode;

  if (countryCode) {
    return countryCodeToFlagEmoji(countryCode);
  }

  return flag && flag.trim().length > 2 ? flag : "";
}

export function FloatingAiAssistant({
  country,
  countrySlug,
  flag,
  itineraryFields = [],
  selectedPlaceSlugs = [],
  variant = "pill",
}: FloatingAiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isGenericAssistant = !countrySlug;
  const [mode, setMode] = useState<AssistantMode>(
    variant === "icon" ? "menu" : "chat",
  );
  const displayFlag = getDisplayFlag({ country, countrySlug, flag });
  const isIconVariant = variant === "icon";
  const suggestedQuestions = isGenericAssistant
    ? genericSuggestedQuestions
    : [
        `What should I pack for ${country}?`,
        ...baseSuggestedQuestions,
      ];

  const openAssistant = () => {
    setMode(isIconVariant && !isGenericAssistant ? "menu" : "chat");
    setIsOpen(true);
  };

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-label="Ask CoVoyage AI"
        className={
          isIconVariant
            ? "fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full border border-[#D8BE8A]/36 bg-[#111112]/95 text-[#D8BE8A] shadow-2xl shadow-black/35 backdrop-blur transition-colors hover:bg-[#181817] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8BE8A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0C]"
            : "fixed bottom-6 right-6 z-50 inline-flex h-14 items-center gap-2.5 rounded-full border border-[#D8BE8A]/36 bg-[#111112]/95 px-5 text-sm font-medium text-[#F5F1E8] shadow-2xl shadow-black/35 backdrop-blur transition-colors hover:bg-[#181817] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8BE8A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0C]"
        }
        onClick={openAssistant}
        type="button"
      >
        <span
          className={
            isIconVariant
              ? "grid h-10 w-10 place-items-center rounded-full bg-[#D8BE8A] text-[#0B0B0C]"
              : "grid h-8 w-8 place-items-center rounded-full bg-[#D8BE8A] text-[#0B0B0C]"
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
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[1px]"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              transition={{ duration: 0.2 }}
            />
            <motion.aside
              animate={{ opacity: 1, x: 0 }}
              aria-label="CoVoyage AI chat panel"
              className="fixed bottom-6 right-6 top-6 z-50 flex w-[calc(100vw-32px)] max-w-[410px] flex-col overflow-hidden rounded-[18px] border border-white/10 bg-[#111112] shadow-2xl shadow-black/40 sm:right-6 sm:w-[410px]"
              exit={{ opacity: 0, x: 36 }}
              initial={{ opacity: 0, x: 52 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <header className="border-b border-white/10 bg-[#0B0B0C]/95 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#D8BE8A] text-[#0B0B0C]">
                        <Bot className="h-4.5 w-4.5" />
                      </span>
                      <h2 className="font-serif text-2xl leading-none text-[#F5F1E8]">
                        CoVoyage AI
                      </h2>
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#D8BE8A]/80">
                        Currently exploring:
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#E8E0D2]">
                        {displayFlag ? (
                          <span className="mr-2" aria-hidden="true">
                            {displayFlag}
                          </span>
                        ) : null}
                        {country}
                      </p>
                    </div>
                  </div>
                  <button
                    aria-label="Close CoVoyage AI"
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-[#B8B0A4] transition-colors hover:border-[#D8BE8A]/36 hover:bg-white/[0.07] hover:text-[#F5F1E8]"
                    onClick={() => setIsOpen(false)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </header>

              {mode === "menu" && !isGenericAssistant ? (
                <AssistantMenu setMode={setMode} />
              ) : null}
              {mode === "itinerary" ? (
                <ItineraryFlow
                  country={country}
                  countrySlug={countrySlug}
                  fields={itineraryFields}
                  selectedPlaceSlugs={selectedPlaceSlugs}
                  setMode={setMode}
                />
              ) : null}
              {mode === "chat" ? (
                <ChatFlow
                  country={country}
                  countrySlug={countrySlug}
                  isGenericAssistant={isGenericAssistant}
                  selectedPlaceSlugs={selectedPlaceSlugs}
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
          className="flex w-full items-center gap-4 border border-white/10 bg-white/[0.035] px-4 py-4 text-left transition-colors hover:border-[#D8BE8A]/30 hover:bg-white/[0.07]"
          onClick={() => setMode("itinerary")}
          type="button"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#D8BE8A] text-[#0B0B0C]">
            <Plane className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-xs font-medium uppercase tracking-[0.2em] text-[#D8BE8A]">
              Create My Itinerary
            </span>
            <span className="mt-1 block text-sm text-[#B8B0A4]">
              Budget, days, and interests.
            </span>
          </span>
        </button>
        <button
          className="flex w-full items-center gap-4 border border-white/10 bg-white/[0.035] px-4 py-4 text-left transition-colors hover:border-[#D8BE8A]/30 hover:bg-white/[0.07]"
          onClick={() => setMode("chat")}
          type="button"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#D8BE8A] text-[#0B0B0C]">
            <MessageCircle className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-xs font-medium uppercase tracking-[0.2em] text-[#D8BE8A]">
              Ask CoVoyage AI
            </span>
            <span className="mt-1 block text-sm text-[#B8B0A4]">
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
  countrySlug,
  fields,
  selectedPlaceSlugs,
  setMode,
}: {
  country: string;
  countrySlug?: string;
  fields: ItineraryField[];
  selectedPlaceSlugs: string[];
  setMode: (mode: AssistantMode) => void;
}) {
  const fallbackFields = [
    { label: "Budget", value: "$1800" },
    { label: "Number of days", value: "7" },
    { label: "Interests", value: "Culture, food, nature" },
  ];
  const formFields = fields.length > 0 ? fields : fallbackFields;
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      formFields.map((field) => [
        field.label === "Days" ? "Number of days" : field.label,
        field.value,
      ]),
    ),
  );
  const [itinerary, setItinerary] = useState<LocalVibeItineraryDay[]>([]);
  const [summary, setSummary] = useState("");
  const [responseSource, setResponseSource] = useState<AssistantResponseSource | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    const slug = countrySlug ?? country.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const daysValue = values["Number of days"] ?? values.Days ?? "5";
    const days = Number.parseInt(daysValue, 10);

    setIsGenerating(true);
    setErrorMessage("");

    try {
      const response = await generateLocalVibeItinerary({
        country_slug: slug,
        country,
        days: Number.isFinite(days) ? days : 5,
        budget: values.Budget,
        interests: values.Interests,
        pace: values.Pace ?? "Balanced",
        selected_place_slugs: selectedPlaceSlugs,
      });

      setSummary(response.summary);
      setItinerary(response.itinerary);
      setResponseSource(response.response_source ?? null);
    } catch {
      setErrorMessage("CoVoyage could not generate this itinerary right now.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
      <button
        aria-label="Back to CoVoyage AI options"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-[#B8B0A4] transition-colors hover:border-[#D8BE8A]/36 hover:bg-white/[0.07] hover:text-[#F5F1E8]"
        onClick={() => setMode("menu")}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <h3 className="mt-4 font-serif text-3xl leading-tight text-[#F5F1E8]">
        Create My {country} Itinerary
      </h3>
      <form className="mt-5 space-y-4">
        {formFields.map((field) => (
          <label
            className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[#D8BE8A]/80"
            key={field.label}
          >
            {field.label === "Days" ? "Number of days" : field.label}
            <input
              className="mt-2 h-12 w-full border border-white/10 bg-black/35 px-4 text-sm text-[#F5F1E8] outline-none placeholder:text-white/35 focus:border-[#D8BE8A]/45"
              onChange={(event) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  [field.label === "Days" ? "Number of days" : field.label]:
                    event.target.value,
                }))
              }
              type="text"
              value={values[field.label === "Days" ? "Number of days" : field.label] ?? ""}
            />
          </label>
        ))}
        <button
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#D8BE8A] text-xs font-medium uppercase tracking-[0.16em] text-[#0B0B0C] transition-colors hover:bg-[#F5F1E8] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isGenerating}
          onClick={handleGenerate}
          type="button"
        >
          {isGenerating ? "Creating Itinerary..." : "Create Itinerary"}
        </button>
      </form>
      {errorMessage ? (
        <p className="mt-4 text-sm leading-6 text-[#D8BE8A]">{errorMessage}</p>
      ) : null}
      {summary ? (
        <div className="mt-5 border border-white/10 bg-white/[0.035] px-4 py-4">
          {responseSource ? <ResponseSourceLabel source={responseSource} /> : null}
          <p className="text-sm leading-6 text-[#B8B0A4]">{summary}</p>
        </div>
      ) : null}
      {itinerary.length ? (
        <div className="mt-4 space-y-3">
          {itinerary.map((day) => (
            <article
              className="border border-white/10 bg-[#151515] px-4 py-4"
              key={`${day.day}-${day.place}`}
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#D8BE8A]/78">
                Day {day.day} / {day.place}
              </p>
              <p className="mt-2 text-sm font-medium text-[#F5F1E8]">{day.focus}</p>
              <p className="mt-2 text-xs leading-5 text-[#B8B0A4]">
                {day.morning} {day.afternoon} {day.evening}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ChatFlow({
  country,
  countrySlug,
  isGenericAssistant,
  selectedPlaceSlugs,
  setMode,
  suggestedQuestions,
}: {
  country: string;
  countrySlug?: string;
  isGenericAssistant: boolean;
  selectedPlaceSlugs: string[];
  setMode: (mode: AssistantMode) => void;
  suggestedQuestions: string[];
}) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      body: isGenericAssistant
        ? "Ask me about destinations, timing, budget, travel style, or which Local Vibe guide to open first."
        : `I already know you are exploring ${country}. Ask me about packing, routes, local etiquette, events, or the curated places on this page.`,
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const sendMessage = async (body: string) => {
    const trimmedBody = body.trim();

    if (!trimmedBody || isSending) {
      return;
    }

    const slug = countrySlug ?? country.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", body: trimmedBody },
    ]);
    setInputValue("");
    setIsSending(true);
    setErrorMessage("");

    try {
      const response = isGenericAssistant
        ? await sendLocalVibeDiscoveryChatMessage({
            message: trimmedBody,
          })
        : await sendLocalVibeChatMessage({
            country_slug: slug,
            country,
            message: trimmedBody,
            selected_place_slugs: selectedPlaceSlugs,
          });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          body: response.message,
          source: response.response_source,
        },
      ]);
    } catch {
      setErrorMessage("CoVoyage AI is unavailable right now.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {!isGenericAssistant ? (
          <button
            aria-label="Back to CoVoyage AI options"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-[#B8B0A4] transition-colors hover:border-[#D8BE8A]/36 hover:bg-white/[0.07] hover:text-[#F5F1E8]"
            onClick={() => setMode("menu")}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : null}
        <section className="mt-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#D8BE8A]">
            {isGenericAssistant ? "Ask about Local Vibe" : `Ask about ${country}`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                className="rounded-full border border-[#D8BE8A]/24 bg-white/[0.035] px-3 py-2 text-xs leading-none text-[#D8BE8A] transition-colors hover:border-[#D8BE8A]/45 hover:bg-white/[0.07]"
                key={question}
                onClick={() => sendMessage(question)}
                type="button"
              >
                {question}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {messages.map((message, index) => (
            <div
              className={
                message.role === "user"
                  ? "ml-auto max-w-[82%] rounded-[18px] rounded-br-[6px] bg-[#D8BE8A] px-4 py-3 text-[#0B0B0C] shadow-lg shadow-black/20"
                  : "max-w-[88%] rounded-[18px] rounded-tl-[6px] border border-white/10 bg-[#151515] px-4 py-3 shadow-sm shadow-black/20"
              }
              key={`${message.role}-${index}`}
            >
              <p
                className={
                  message.role === "user"
                    ? "text-sm leading-6"
                    : "text-sm leading-6 text-[#B8B0A4]"
                }
              >
                {message.role === "assistant" && message.source ? (
                  <ResponseSourceLabel source={message.source} />
                ) : null}
                {message.body}
              </p>
            </div>
          ))}
          {isSending ? (
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#D8BE8A]/80">
              CoVoyage is thinking...
            </p>
          ) : null}
          {errorMessage ? (
            <p className="text-sm leading-6 text-[#D8BE8A]">{errorMessage}</p>
          ) : null}
        </section>
      </div>

      <form
        className="border-t border-white/10 bg-[#0B0B0C]/95 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(inputValue);
        }}
      >
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 shadow-inner shadow-black/20 focus-within:border-[#D8BE8A]/45">
          <input
            aria-label={`Ask anything about ${country}`}
            className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[#F5F1E8] outline-none placeholder:text-white/35"
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={
              isGenericAssistant
                ? "Ask anything about Local Vibe..."
                : `Ask anything about ${country}...`
            }
            type="text"
            value={inputValue}
          />
          <button
            aria-label="Send message"
            className="grid h-9 w-9 place-items-center rounded-full bg-[#D8BE8A] text-[#0B0B0C] transition-colors hover:bg-[#F5F1E8] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSending}
            type="submit"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </>
  );
}

function ResponseSourceLabel({ source }: { source: AssistantResponseSource }) {
  return (
    <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#D8BE8A]/72">
      {source === "gemini" ? "Gemini" : "Fallback"}
    </span>
  );
}
