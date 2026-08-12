"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { clearAuth, isAuthenticated, onAuthChange } from "@/lib/api";

const navItems = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Profile", href: "/profile" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hasToken, setHasToken] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const brandHref =
    pathname?.startsWith("/explore/") ? "/explore" : "/";
  const isHomePage = pathname === "/";

  useEffect(() => {
    const syncAuthState = () => {
      setHasToken(isAuthenticated());
    };

    syncAuthState();
    return onAuthChange(syncAuthState);
  }, []);

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
            <button
              className="text-xs font-medium uppercase tracking-[0.22em] text-white transition-colors hover:text-white/80"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
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
                <button
                  className="text-xs font-medium uppercase tracking-[0.22em] text-white transition-colors hover:text-white/80"
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
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
