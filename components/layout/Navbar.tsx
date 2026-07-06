"use client";

import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { clearAuth, isAuthenticated, onAuthChange } from "@/lib/api";

const navItems = [
  { label: "Community", href: "/#community" },
  { label: "Find Your Tribe", href: "/tribe" },
  { label: "Local Vibe", href: "/vibe" },
  { label: "Journal", href: "/blogs" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hasToken, setHasToken] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      setHasToken(isAuthenticated());
    };

    syncAuthState();
    return onAuthChange(syncAuthState);
  }, []);

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
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#fbf8f2]/90 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-stone-300 bg-white text-sm font-semibold text-stone-800">
            CV
          </span>
          <span className="font-serif text-2xl text-stone-900">CoVoyage</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
  <Link
    key={item.label}
    href={item.href}
    className="text-xs font-medium uppercase tracking-[0.22em] text-stone-600 transition-colors hover:text-stone-950"
  >
    {item.label}
  </Link>
))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild aria-label="Search" size="sm" variant="ghost">
            <Link href="/blogs">
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          {hasToken ? (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/profile" onClick={handleProfileClick}>
                  Profile
                </Link>
              </Button>
              <Button size="sm" type="button" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <Button
          aria-expanded={isMenuOpen}
          aria-label="Open navigation"
          className="md:hidden"
          size="sm"
          type="button"
          variant="outline"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </nav>
      {isMenuOpen ? (
        <div className="border-t border-stone-200 bg-[#fbf8f2] px-5 py-5 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs font-medium uppercase tracking-[0.22em] text-stone-600 transition-colors hover:text-stone-950"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              {hasToken ? (
                <>
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/profile" onClick={handleProfileClick}>
                      Profile
                    </Link>
                  </Button>
                  <Button size="sm" type="button" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
