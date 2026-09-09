"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import {
  ApiError,
  AuthSessionResponse,
  apiRequest,
  clearAuth,
  getValidAuthToken,
} from "@/lib/api";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      setIsAllowed(false);
      setAuthError("");
      const token = getValidAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        await apiRequest<AuthSessionResponse>("/auth/session", { token });

        if (isMounted) {
          setIsAllowed(true);
        }
      } catch (caughtError) {
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          clearAuth();
          router.replace("/login");
          return;
        }

        if (isMounted) {
          setAuthError(
            caughtError instanceof ApiError
              ? caughtError.detail
              : "Unable to verify your session.",
          );
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (!isAllowed) {
    if (authError) {
      return (
        <div className="grid min-h-screen place-items-center bg-[#050505] px-5 text-[#f8f4ea]">
          <div className="max-w-md border border-white/10 bg-white/[0.035] p-6 text-center">
            <p className="font-serif text-2xl text-white">Session Check Failed</p>
            <p className="mt-3 text-sm leading-6 text-white/62">{authError}</p>
          </div>
        </div>
      );
    }

    return null;
  }

  return children;
}
