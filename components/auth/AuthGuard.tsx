"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import {
  ApiError,
  AuthSessionResponse,
  apiRequest,
  clearAuth,
  getAuthToken,
  isAuthTokenExpired,
} from "@/lib/api";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const token = getAuthToken();

      if (!token || isAuthTokenExpired(token)) {
        clearAuth();
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
        }

        router.replace("/login");
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (!isAllowed) {
    return null;
  }

  return children;
}
