"use client";

import { useEffect, useState } from "react";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  officeName?: string | null;
  wilayaId?: string | null;
  customWilaya?: string | null;
  wilayaName?: string | null;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/auth/me")
      .then(async (res) => {
        if (!isMounted) return;
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data?.user ?? null);
      })
      .catch(() => {
        if (!isMounted) return;
        setUser(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { user, loading };
}
