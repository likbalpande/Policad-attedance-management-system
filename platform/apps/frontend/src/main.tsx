import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import { authStorage } from "@/lib/auth-storage";
import { useAuthStore } from "@/stores/auth.store";

const rootElement = document.getElementById("root")!;

// createBrowserRouter (imported transitively via App -> routes/router) fires
// loaders for the initial route as soon as the router is constructed - not
// when <RouterProvider> mounts. So App can't even be imported until the
// session is rehydrated, or route guards race the async Preferences read and
// see the default "pending" state instead of the real one.
async function bootstrap() {
  const tokens = await authStorage.getTokens();
  if (tokens) {
    useAuthStore.getState().setSession(tokens);
  } else {
    useAuthStore.getState().clearSession();
  }

  const { default: App } = await import("./App");

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
