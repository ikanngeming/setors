import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (
          error instanceof TRPCClientError &&
          (error.data?.code === "UNAUTHORIZED" ||
            error.data?.code === "FORBIDDEN" ||
            error.message === UNAUTHED_ERR_MSG)
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// Guard: hanya redirect sekali per session page load
let isRedirectingToLogin = false;

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;
  if (isRedirectingToLogin) return;

  const isUnauthorized =
    error.message === UNAUTHED_ERR_MSG ||
    error.data?.code === "UNAUTHORIZED" ||
    error.data?.code === "FORBIDDEN";

  if (!isUnauthorized) return;

  // auth.me error ditangani oleh AuthContext & Router — skip di sini
  const key = (error as any)?.meta?.queryKey;
  if (Array.isArray(key) && key[0]?.[0] === "auth" && key[0]?.[1] === "me") {
    return;
  }

  isRedirectingToLogin = true;
  const loginUrl = getLoginUrl();
  if (loginUrl && loginUrl !== "/") {
    window.location.href = loginUrl;
  }
};

queryClient.getQueryCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectToLoginIfUnauthorized(event.query.state.error);
  }
});

queryClient.getMutationCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectToLoginIfUnauthorized(event.mutation.state.error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
