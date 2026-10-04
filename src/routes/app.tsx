import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProductShell } from "@/components/parking/ProductShell";
export const Route = createFileRoute("/app")({
  component: () => (
    <ProductShell area="driver">
      <Outlet />
    </ProductShell>
  ),
  head: () => ({
    meta: [{ title: "Driver App | SPM ECO" }, { name: "robots", content: "noindex" }],
  }),
});
