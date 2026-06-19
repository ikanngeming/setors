import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useRef } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const hasRedirected = useRef(false);

  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,   // 5 menit — tidak re-fetch tiap render
    gcTime: 10 * 60 * 1000,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const user = meQuery.data ?? null;
  const loading = meQuery.isLoading || logoutMutation.isPending;
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (user) {
      // Reset flag kalau user sudah login, supaya bisa redirect lagi kalau logout
      hasRedirected.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    if (hasRedirected.current) return; // Jangan redirect lebih dari sekali

    const target = redirectPath ?? getLoginUrl();
    if (!target || target === "/") return; // getLoginUrl() fallback = tidak redirect
    if (window.location.href === target) return;

    hasRedirected.current = true;
    window.location.href = target;
  }, [redirectOnUnauthenticated, redirectPath, loading, user]);

  return {
    user,
    loading,
    isAuthenticated,
    error: meQuery.error ?? logoutMutation.error ?? null,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
