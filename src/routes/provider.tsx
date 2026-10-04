import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProductShell } from "@/components/parking/ProductShell";
export const Route = createFileRoute("/provider")({
  component: () => (
    <ProductShell area="provider">
      <Outlet />
    </ProductShell>
  ),
  head: () => ({
    meta: [{ title: "Provider Portal Demo | SPM ECO" }, { name: "robots", content: "noindex" }],
  }),
});
