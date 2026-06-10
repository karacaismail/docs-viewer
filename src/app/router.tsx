// TanStack Router — tek dinamik route: /docs/$section/$page (10 §Routing)
import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import { AppShell } from "../components/app-shell/AppShell";
import { ContentArea } from "../components/content/ContentArea";
import { navigation } from "../engine";

const firstSlug = navigation.categories[0]?.groups[0]?.items[0]?.slug ?? "";

export const rootRoute = createRootRoute({ component: AppShell });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    const [section, page] = firstSlug.split("/");
    throw redirect({ to: "/docs/$section/$page", params: { section, page } });
  },
});

export const docRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs/$section/$page",
  component: ContentArea,
});

const routeTree = rootRoute.addChildren([indexRoute, docRoute]);
// basepath: Pages alt yolunda da kök dağıtımda da çalışır
export const router = createRouter({ routeTree, basepath: import.meta.env.BASE_URL });

declare module "@tanstack/react-router" {
  interface Register { router: typeof router }
}
