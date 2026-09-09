"use client";

import { CalendarDays, MapPin, Users, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { DestinationEvent } from "@/components/explore/destinationData";
import { EventSubmission } from "@/components/explore/SubmissionActions";
import { getValidAuthToken } from "@/lib/api";
import {
  fetchDestinationEvents,
  joinDestinationEvent,
  leaveDestinationEvent,
  type DestinationEventResponse,
} from "@/lib/eventsApi";

type EventsBoardProps = {
  country: string;
  countrySlug: string;
  events: DestinationEvent[];
  isDarkEditorial: boolean;
};

type RenderedEvent = DestinationEvent & {
  backendId?: string;
  dateStart?: string;
  dateEnd?: string | null;
  time?: string | null;
  organizerName?: string | null;
  participantCount: number;
  viewerHasJoined: boolean;
  viewerHasSaved: boolean;
};

const fallbackImageEvent: DestinationEvent = {
  title: "Local event",
  category: "Community",
  location: "Local venue",
  date: "Upcoming",
  description: "A traveler-friendly local gathering.",
  image: "/travel/iceland-waterfall.jpg",
  imageAlt: "Travelers gathering at a scenic destination",
};

function formatEventDate(dateStart: string, dateEnd?: string | null) {
  const formatter = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const start = new Date(`${dateStart}T00:00:00`);

  if (Number.isNaN(start.getTime())) {
    return dateStart;
  }

  if (!dateEnd || dateEnd === dateStart) {
    return formatter.format(start);
  }

  const end = new Date(`${dateEnd}T00:00:00`);

  if (Number.isNaN(end.getTime())) {
    return formatter.format(start);
  }

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function mapApiEvent(
  event: DestinationEventResponse,
  fallback: DestinationEvent,
): RenderedEvent {
  return {
    backendId: event.id,
    title: event.title,
    category: normalizeCategory(event.category),
    location: event.location,
    date: formatEventDate(event.date_start, event.date_end),
    dateStart: event.date_start,
    dateEnd: event.date_end,
    time: event.time,
    description: event.description,
    image: event.media?.url ?? fallback.image,
    imageAlt: event.media?.alt ?? fallback.imageAlt,
    organizerName: event.organizer_name,
    participantCount: event.participant_count ?? 0,
    viewerHasJoined: event.viewer_has_joined ?? false,
    viewerHasSaved: event.viewer_has_saved ?? false,
  };
}

function normalizeCategory(category: string) {
  return category.trim().replace(/\s+/g, " ") || "Community";
}

function eventKey(event: Pick<DestinationEvent, "title" | "date" | "location">) {
  return [event.title, event.date, event.location]
    .map((part) => part.toLowerCase().trim())
    .join("|");
}

function mapStaticEvent(event: DestinationEvent): RenderedEvent {
  return {
    ...event,
    category: normalizeCategory(event.category),
    participantCount: 0,
    viewerHasJoined: false,
    viewerHasSaved: false,
  };
}

export function EventsBoard({
  country,
  countrySlug,
  events,
  isDarkEditorial,
}: EventsBoardProps) {
  const [apiEvents, setApiEvents] = useState<DestinationEventResponse[] | null>(
    null,
  );
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<RenderedEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isUpdatingParticipation, setIsUpdatingParticipation] = useState(false);

  useEffect(() => {
    let isActive = true;

    fetchDestinationEvents(countrySlug, getValidAuthToken())
      .then((fetchedEvents) => {
        if (!isActive) {
          return;
        }

        setApiEvents(fetchedEvents);
        setErrorMessage(null);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setErrorMessage("Event listings are unavailable right now.");
      });

    return () => {
      isActive = false;
    };
  }, [countrySlug]);

  const renderedEvents = useMemo(() => {
    const staticEvents = events.map(mapStaticEvent);

    if (!apiEvents?.length) {
      return staticEvents;
    }

    return apiEvents.map((event, index) => {
      const fallback = events[index % Math.max(events.length, 1)] ?? fallbackImageEvent;
      return mapApiEvent(event, fallback);
    });
  }, [apiEvents, events]);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(renderedEvents.map((event) => event.category))),
    ],
    [renderedEvents],
  );

  const filteredEvents = useMemo(
    () =>
      activeCategory === "All"
        ? renderedEvents
        : renderedEvents.filter((event) => event.category === activeCategory),
    [activeCategory, renderedEvents],
  );

  const updateApiEvent = (updatedEvent: DestinationEventResponse) => {
    setApiEvents((currentEvents) =>
      (currentEvents ?? []).map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event,
      ),
    );

    setSelectedEvent(mapApiEvent(updatedEvent, events[0] ?? fallbackImageEvent));
  };

  const handleJoinToggle = async (event: RenderedEvent) => {
    if (!event.backendId) {
      setActionMessage("This event is not available for joining yet.");
      return;
    }

    const token = getValidAuthToken();

    if (!token) {
      setActionMessage("Please log in to join events.");
      return;
    }

    setIsUpdatingParticipation(true);

    try {
      const updatedEvent = event.viewerHasJoined
        ? await leaveDestinationEvent(event.backendId, token)
        : await joinDestinationEvent(event.backendId, token);
      updateApiEvent(updatedEvent);
      setActionMessage(null);
    } catch {
      setActionMessage("That event action could not be saved.");
    } finally {
      setIsUpdatingParticipation(false);
    }
  };

  return (
    <section
      className={
        isDarkEditorial
          ? "border border-[#D8BE8A]/20 bg-[#111112] p-4 shadow-2xl shadow-black/24 sm:p-5 lg:p-6"
          : "rounded-[6px] border border-[#7c563f] bg-[linear-gradient(135deg,#7a4f35,#b1805c_45%,#6f452f)] p-4 shadow-2xl shadow-[#7d584e]/25 sm:p-5 lg:p-6"
      }
    >
      <div
        className={
          isDarkEditorial
            ? "border border-white/10 bg-[#151515] px-5 py-7 shadow-inner shadow-black/20 sm:px-8 lg:px-10"
            : "border border-[#b78963] bg-[#f4e5cf] px-5 py-7 shadow-inner shadow-[#6f452f]/20 sm:px-8 lg:px-10"
        }
      >
        <div
          className={
            isDarkEditorial
              ? "border-y border-[#D8BE8A]/20 py-4 text-center"
              : "border-y border-[#7d584e] py-4 text-center"
          }
        >
          <p
            className={
              isDarkEditorial
                ? "text-xs font-medium uppercase tracking-[0.34em] text-[#D8BE8A]"
                : "text-xs font-medium uppercase tracking-[0.34em] text-[#7d584e]"
            }
          >
            Local Vibe Events
          </p>
          <h2
            className={
              isDarkEditorial
                ? "mt-2 font-serif text-5xl leading-none text-[#F5F1E8] sm:text-6xl"
                : "mt-2 font-serif text-5xl leading-none text-[#4a3227] sm:text-6xl"
            }
          >
            {country}
          </h2>
          <p
            className={
              isDarkEditorial
                ? "mt-2 text-xs font-medium uppercase tracking-[0.24em] text-[#D8BE8A]/72"
                : "mt-2 text-xs font-medium uppercase tracking-[0.24em] text-[#7d584e]"
            }
          >
            Upcoming
          </p>
          <div className="mt-4">
            <EventSubmission
              country={country}
              countrySlug={countrySlug}
              onEventCreated={(event) =>
                setApiEvents((currentEvents) => [event, ...(currentEvents ?? [])])
              }
              variant={isDarkEditorial ? "dark" : "light"}
            />
          </div>
        </div>

        {errorMessage ? (
          <p
            className={
              isDarkEditorial
                ? "mt-5 text-sm text-[#D8BE8A]"
                : "mt-5 text-sm text-[#7d584e]"
            }
          >
            {errorMessage}
          </p>
        ) : null}

        {categories.length > 2 ? (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  className={
                    isDarkEditorial
                      ? `rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors ${
                          isActive
                            ? "border-[#D8BE8A] bg-[#D8BE8A] text-[#0B0B0C]"
                            : "border-[#D8BE8A]/24 text-[#D8BE8A] hover:border-[#D8BE8A]/45"
                        }`
                      : `rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors ${
                          isActive
                            ? "border-[#7d584e] bg-[#7d584e] text-[#fffaf3]"
                            : "border-[#9c7357] text-[#7d584e] hover:bg-[#ead7bd]"
                        }`
                  }
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  type="button"
                >
                  {category}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="mt-7 space-y-4">
          {filteredEvents.map((event, index) => (
            <EventCard
              event={event}
              index={index}
              isDarkEditorial={isDarkEditorial}
              key={event.backendId ?? eventKey(event)}
              onInfo={() => {
                setActionMessage(null);
                setSelectedEvent(event);
              }}
            />
          ))}
        </div>
      </div>

      {selectedEvent ? (
        <EventDetailModal
          actionMessage={actionMessage}
          event={selectedEvent}
          isDarkEditorial={isDarkEditorial}
          onClose={() => setSelectedEvent(null)}
          isUpdatingParticipation={isUpdatingParticipation}
          onJoinToggle={() => handleJoinToggle(selectedEvent)}
        />
      ) : null}
    </section>
  );
}

function EventCard({
  event,
  index,
  isDarkEditorial,
  onInfo,
}: {
  event: RenderedEvent;
  index: number;
  isDarkEditorial: boolean;
  onInfo: () => void;
}) {
  return (
    <article
      className={
        isDarkEditorial
          ? "grid gap-4 border border-white/10 bg-[#0E0E0F] p-3 shadow-sm shadow-black/20 transition duration-300 hover:border-[#D8BE8A]/26 hover:bg-[#181817] sm:grid-cols-[126px_minmax(0,1fr)_auto] sm:items-center"
          : "grid gap-4 border border-[#9c7357] bg-[#fbf3e6] p-3 shadow-sm shadow-[#7d584e]/15 sm:grid-cols-[126px_minmax(0,1fr)_auto] sm:items-center"
      }
    >
      <div
        className={
          isDarkEditorial
            ? "group relative min-h-[108px] overflow-hidden border border-white/10 bg-[#151515]"
            : "relative min-h-[108px] overflow-hidden border border-[#b58b6e] bg-[#dec7ae]"
        }
      >
        <Image
          alt={event.imageAlt}
          className={
            isDarkEditorial
              ? "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              : "absolute inset-0 h-full w-full object-cover"
          }
          fill
          sizes="126px"
          src={event.image}
        />
      </div>
      <div className="min-w-0">
        <p
          className={
            isDarkEditorial
              ? "text-[10px] font-medium uppercase tracking-[0.22em] text-[#D8BE8A]/76"
              : "text-[10px] font-medium uppercase tracking-[0.22em] text-[#9b6b5f]"
          }
        >
          Event 0{index + 1}
        </p>
        <h3
          className={
            isDarkEditorial
              ? "mt-1 font-serif text-2xl leading-tight text-[#F5F1E8] sm:text-3xl"
              : "mt-1 font-serif text-2xl leading-tight text-[#443733] sm:text-3xl"
          }
        >
          {event.title}
        </h3>
        <div
          className={
            isDarkEditorial
              ? "mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-[#9E9589]"
              : "mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-[#7b665e]"
          }
        >
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays
              className={
                isDarkEditorial
                  ? "h-3.5 w-3.5 text-[#D8BE8A]"
                  : "h-3.5 w-3.5 text-[#9b6b5f]"
              }
            />
            {event.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin
              className={
                isDarkEditorial
                  ? "h-3.5 w-3.5 text-[#D8BE8A]"
                  : "h-3.5 w-3.5 text-[#9b6b5f]"
              }
            />
            {event.location}
          </span>
        </div>
        <p
          className={
            isDarkEditorial
              ? "mt-3 text-sm leading-6 text-[#B8B0A4]"
              : "mt-3 text-sm leading-6 text-[#6f5b53]"
          }
        >
          {event.description}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
        <span
          className={
            isDarkEditorial
              ? "inline-flex rounded-full border border-[#D8BE8A]/28 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#D8BE8A]"
              : "inline-flex rounded-full border border-[#9c7357] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#7d584e]"
          }
        >
          {event.category}
        </span>
        <button
          className={
            isDarkEditorial
              ? "inline-flex rounded-full border border-[#D8BE8A]/36 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#D8BE8A] transition-colors hover:bg-[#D8BE8A] hover:text-[#0B0B0C] sm:mt-4"
              : "inline-flex rounded-full border border-[#7d584e] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#5a3b2d] sm:mt-4"
          }
          onClick={onInfo}
          type="button"
        >
          Info
        </button>
      </div>
    </article>
  );
}

function EventDetailModal({
  actionMessage,
  event,
  isUpdatingParticipation,
  isDarkEditorial,
  onClose,
  onJoinToggle,
}: {
  actionMessage: string | null;
  event: RenderedEvent;
  isUpdatingParticipation: boolean;
  isDarkEditorial: boolean;
  onClose: () => void;
  onJoinToggle: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/48 px-4 backdrop-blur-[2px]">
      <section
        aria-label={`${event.title} details`}
        className={
          isDarkEditorial
            ? "max-h-[88vh] w-full max-w-2xl overflow-y-auto border border-[#D8BE8A]/24 bg-[#111112] p-4 shadow-2xl shadow-black/40"
            : "max-h-[88vh] w-full max-w-2xl overflow-y-auto border border-[#d8b7aa] bg-[#fffaf3] p-4 shadow-2xl shadow-[#4e3f39]/25"
        }
      >
        <div
          className={
            isDarkEditorial
              ? "flex items-start justify-between gap-4 border-b border-white/10 pb-4"
              : "flex items-start justify-between gap-4 border-b border-[#eadbd2] pb-4"
          }
        >
          <div>
            <p
              className={
                isDarkEditorial
                  ? "text-[10px] font-medium uppercase tracking-[0.18em] text-[#D8BE8A]"
                  : "text-[10px] font-medium uppercase tracking-[0.18em] text-[#a16f61]"
              }
            >
              {event.category}
            </p>
            <h2
              className={
                isDarkEditorial
                  ? "mt-1 font-serif text-2xl leading-tight text-[#F5F1E8]"
                  : "mt-1 font-serif text-2xl leading-tight text-[#443733]"
              }
            >
              {event.title}
            </h2>
          </div>
          <button
            aria-label="Close"
            className={
              isDarkEditorial
                ? "grid h-9 w-9 place-items-center rounded-full border border-[#D8BE8A]/24 text-[#D8BE8A] transition-colors hover:bg-[#D8BE8A] hover:text-[#0B0B0C]"
                : "grid h-9 w-9 place-items-center rounded-full border border-[#d8b7aa] text-[#6f5b53] transition-colors hover:bg-[#efe1d8]"
            }
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="pt-5">
          <div
            className={
              isDarkEditorial
                ? "relative min-h-[220px] overflow-hidden border border-white/10 bg-[#151515]"
                : "relative min-h-[220px] overflow-hidden border border-[#d8b7aa] bg-[#dec7ae]"
            }
          >
            <Image
              alt={event.imageAlt}
              className="absolute inset-0 h-full w-full object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              src={event.image}
            />
          </div>

          <div
            className={
              isDarkEditorial
                ? "mt-5 grid gap-3 text-[11px] uppercase tracking-[0.14em] text-[#9E9589] sm:grid-cols-2"
                : "mt-5 grid gap-3 text-[11px] uppercase tracking-[0.14em] text-[#7b665e] sm:grid-cols-2"
            }
          >
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays
                className={
                  isDarkEditorial
                    ? "h-3.5 w-3.5 text-[#D8BE8A]"
                    : "h-3.5 w-3.5 text-[#9b6b5f]"
                }
              />
              {event.date}
              {event.time ? ` / ${event.time}` : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin
                className={
                  isDarkEditorial
                    ? "h-3.5 w-3.5 text-[#D8BE8A]"
                    : "h-3.5 w-3.5 text-[#9b6b5f]"
                }
              />
              {event.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users
                className={
                  isDarkEditorial
                    ? "h-3.5 w-3.5 text-[#D8BE8A]"
                    : "h-3.5 w-3.5 text-[#9b6b5f]"
                }
              />
              {event.participantCount} joined
            </span>
            {event.organizerName ? <span>Organized by {event.organizerName}</span> : null}
          </div>

          <p
            className={
              isDarkEditorial
                ? "mt-5 text-sm leading-6 text-[#B8B0A4]"
                : "mt-5 text-sm leading-6 text-[#6f5b53]"
            }
          >
            {event.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className={
                isDarkEditorial
                  ? "inline-flex items-center gap-2 rounded-full border border-[#D8BE8A]/36 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#D8BE8A] transition-colors hover:bg-[#D8BE8A] hover:text-[#0B0B0C] disabled:cursor-not-allowed disabled:opacity-45"
                  : "inline-flex items-center gap-2 rounded-full border border-[#7d584e] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#5a3b2d] disabled:cursor-not-allowed disabled:opacity-45"
              }
              disabled={isUpdatingParticipation}
              onClick={onJoinToggle}
              type="button"
            >
              <Users className="h-3.5 w-3.5" />
              {isUpdatingParticipation
                ? "Updating"
                : event.viewerHasJoined
                  ? "Leave Event"
                  : "Join Event"}
            </button>
          </div>

          {actionMessage ? (
            <p
              className={
                isDarkEditorial
                  ? "mt-4 text-sm text-[#D8BE8A]"
                  : "mt-4 text-sm text-[#8d6255]"
              }
            >
              {actionMessage}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
