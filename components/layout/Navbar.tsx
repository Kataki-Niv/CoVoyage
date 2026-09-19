"use client";

import { Bell, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  apiRequest,
  clearAuth,
  getValidAuthToken,
  isAuthenticated,
  onAuthChange,
} from "@/lib/api";

const navItems = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Profile", href: "/profile" },
];

const TRIBE_REQUEST_REFRESH_EVENT = "covoyage-tribe-requests-change";
const TRIBE_REQUEST_FOCUS_KEY = "covoyage_focus_incoming_requests";
const GROUP_REQUEST_REFRESH_EVENT = "covoyage-group-requests-change";
const GROUP_REQUEST_FOCUS_KEY = "covoyage_focus_group_requests";
const TRIBE_REQUEST_POLL_MS = 15000;

type TribeRequestProfile = {
  name?: string;
  username?: string;
};

type TribeConnectionRequestNotice = {
  id: string;
  requester_profile?: TribeRequestProfile | null;
  other_profile?: TribeRequestProfile | null;
};

type GroupJoinRequestNotice = {
  id: string;
  requester_profile?: TribeRequestProfile | null;
  voyage?: {
    title?: string | null;
    destination?: string | null;
  } | null;
};

function getRequesterName(request: TribeConnectionRequestNotice | null) {
  const profile = request?.requester_profile || request?.other_profile;

  return profile?.name || profile?.username || "Someone";
}

function getGroupRequesterName(request: GroupJoinRequestNotice | null) {
  const profile = request?.requester_profile;

  return profile?.name || profile?.username || "Someone";
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hasToken, setHasToken] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [incomingTribeRequests, setIncomingTribeRequests] = useState<
    TribeConnectionRequestNotice[]
  >([]);
  const [incomingGroupJoinRequests, setIncomingGroupJoinRequests] = useState<
    GroupJoinRequestNotice[]
  >([]);
  const brandHref =
    pathname?.startsWith("/explore/") ? "/explore" : "/";
  const isHomePage = pathname === "/";
  const latestIncomingRequest = incomingTribeRequests[0] || null;
  const latestGroupJoinRequest = incomingGroupJoinRequests[0] || null;
  const notificationCount =
    incomingTribeRequests.length + incomingGroupJoinRequests.length;
  const activeNotification = latestGroupJoinRequest
    ? {
        href: "/tribe?mode=group&focus=creator-requests",
        kind: "group" as const,
        label: `${getGroupRequesterName(latestGroupJoinRequest)} requested ${
          latestGroupJoinRequest.voyage?.title || "your voyage"
        }`,
        title: `${getGroupRequesterName(latestGroupJoinRequest)} requested to join your ${
          latestGroupJoinRequest.voyage?.title || "Group Voyage"
        }.`,
      }
    : latestIncomingRequest
      ? {
          href: "/tribe?focus=incoming-requests",
          kind: "tribe" as const,
          label: `${getRequesterName(latestIncomingRequest)} sent a request`,
          title: `${getRequesterName(latestIncomingRequest)} sent you a connection request.`,
        }
      : null;

  useEffect(() => {
    const syncAuthState = () => {
      const authenticated = isAuthenticated();

      setHasToken(authenticated);

      if (!authenticated) {
        setIncomingTribeRequests([]);
        setIncomingGroupJoinRequests([]);
      }
    };

    syncAuthState();
    return onAuthChange(syncAuthState);
  }, []);

  const refreshIncomingRequests = useCallback(async () => {
    const token = getValidAuthToken();

    if (!token) {
      setIncomingTribeRequests([]);
      setIncomingGroupJoinRequests([]);
      return;
    }

    const [tribeRequests, groupRequests] = await Promise.all([
      apiRequest<TribeConnectionRequestNotice[]>(
        "/connections/requests/incoming",
        { token },
      ).catch(() => []),
      apiRequest<GroupJoinRequestNotice[]>(
        "/group-voyages/requests/incoming",
        { token },
      ).catch(() => []),
    ]);

    setIncomingTribeRequests(tribeRequests);
    setIncomingGroupJoinRequests(groupRequests);
  }, []);

  const refreshIncomingRequestsSafely = useCallback(async () => {
    try {
      await refreshIncomingRequests();
    } catch {
      setIncomingTribeRequests([]);
      setIncomingGroupJoinRequests([]);
    }
  }, [refreshIncomingRequests]);

  useEffect(() => {
    if (!hasToken) {
      return;
    }

    const initialRefreshId = window.setTimeout(() => {
      void refreshIncomingRequestsSafely();
    }, 0);

    const intervalId = window.setInterval(
      refreshIncomingRequestsSafely,
      TRIBE_REQUEST_POLL_MS,
    );
    const handleFocus = () => {
      void refreshIncomingRequestsSafely();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void refreshIncomingRequestsSafely();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener(TRIBE_REQUEST_REFRESH_EVENT, handleFocus);
    window.addEventListener(GROUP_REQUEST_REFRESH_EVENT, handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(initialRefreshId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(TRIBE_REQUEST_REFRESH_EVENT, handleFocus);
      window.removeEventListener(GROUP_REQUEST_REFRESH_EVENT, handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasToken, refreshIncomingRequestsSafely]);

  useEffect(() => {
    if (!isHomePage) {
      return;
    }

    const syncScrollState = () => {
      setIsScrolled(window.scrollY > 8);
    };

    syncScrollState();
    window.addEventListener("scroll", syncScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncScrollState);
    };
  }, [isHomePage]);

  const handleLogout = () => {
    clearAuth();
    setIsMenuOpen(false);
    router.push("/login");
  };

  const handleProfileClick = () => {
    setIsMenuOpen(false);

    if (pathname === "/profile") {
      window.location.reload();
    }
  };

  const handleNotificationClick = (kind: "tribe" | "group") => {
    window.sessionStorage.setItem(
      kind === "group" ? GROUP_REQUEST_FOCUS_KEY : TRIBE_REQUEST_FOCUS_KEY,
      "1",
    );
    setIsMenuOpen(false);

    if (pathname === "/tribe") {
      window.dispatchEvent(
        new Event(
          kind === "group"
            ? "covoyage-focus-group-requests"
            : "covoyage-focus-incoming-requests",
        ),
      );
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 ${
        isHomePage && !isScrolled
          ? "border-b border-transparent bg-transparent shadow-none"
          : "border-b border-white/10 bg-black/30 shadow-sm shadow-black/20 backdrop-blur-2xl"
      } transition-colors duration-300`}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link className="flex items-center gap-3" href={brandHref}>
          <span className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/10 text-sm font-semibold text-white shadow-sm shadow-black/20">
            CV
          </span>
          <span className="font-serif text-xl text-white">CoVoyage</span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs font-medium uppercase tracking-[0.22em] text-white transition-colors hover:text-white/80"
              onClick={item.href === "/profile" ? handleProfileClick : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-6 md:flex">
          {hasToken ? (
            <>
              {activeNotification ? (
                <Link
                  className="inline-flex max-w-[18rem] items-center gap-2 border border-[#f8f4ea]/24 bg-[#f8f4ea]/10 px-3 py-2 text-xs font-medium text-[#f8f4ea] transition-colors hover:bg-[#f8f4ea]/16"
                  href={activeNotification.href}
                  title={activeNotification.title}
                  onClick={() => handleNotificationClick(activeNotification.kind)}
                >
                  <Bell className="h-4 w-4 shrink-0" />
                  <span className="truncate">{activeNotification.label}</span>
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#f8f4ea] px-1.5 text-[10px] font-semibold leading-none text-black">
                    {notificationCount}
                  </span>
                </Link>
              ) : null}
              <button
                className="text-xs font-medium uppercase tracking-[0.22em] text-white transition-colors hover:text-white/80"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                className="text-xs font-medium uppercase tracking-[0.22em] text-white transition-colors hover:text-white/80"
                href="/login"
              >
                Login
              </Link>
              <Link
                className="text-xs font-medium uppercase tracking-[0.22em] text-white transition-colors hover:text-white/80"
                href="/signup"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <Button
          aria-expanded={isMenuOpen}
          aria-label="Open navigation"
          className="border-white/25 bg-white/10 text-white hover:bg-white/20 md:hidden"
          size="sm"
          type="button"
          variant="outline"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </nav>
      {isMenuOpen ? (
        <div className="border-t border-white/10 bg-black/30 px-5 py-5 shadow-lg shadow-black/20 backdrop-blur-2xl md:hidden">
          <div className="mx-auto grid max-w-7xl gap-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs font-medium uppercase tracking-[0.22em] text-white transition-colors hover:text-white/80"
                onClick={
                  item.href === "/profile"
                    ? handleProfileClick
                    : () => setIsMenuOpen(false)
                }
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-6 pt-2">
              {hasToken ? (
                <div className="grid gap-4">
                  {activeNotification ? (
                    <Link
                      className="inline-flex w-fit items-center gap-2 border border-[#f8f4ea]/24 bg-[#f8f4ea]/10 px-3 py-2 text-xs font-medium text-[#f8f4ea] transition-colors hover:bg-[#f8f4ea]/16"
                      href={activeNotification.href}
                      title={activeNotification.title}
                      onClick={() =>
                        handleNotificationClick(activeNotification.kind)
                      }
                    >
                      <Bell className="h-4 w-4 shrink-0" />
                      <span>{activeNotification.label}</span>
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#f8f4ea] px-1.5 text-[10px] font-semibold leading-none text-black">
                        {notificationCount}
                      </span>
                    </Link>
                  ) : null}
                  <button
                    className="w-fit text-xs font-medium uppercase tracking-[0.22em] text-white transition-colors hover:text-white/80"
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    className="text-xs font-medium uppercase tracking-[0.22em] text-white transition-colors hover:text-white/80"
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    className="text-xs font-medium uppercase tracking-[0.22em] text-white transition-colors hover:text-white/80"
                    href="/signup"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
