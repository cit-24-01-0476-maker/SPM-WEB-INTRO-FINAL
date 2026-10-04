import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProductShell } from "@/components/parking/ProductShell";
export const Route = createFileRoute("/parking-admin")({
  component: () => (
    <ProductShell area="operations">
      <Outlet />
    </ProductShell>
  ),
  head: () => ({
    meta: [{ title: "Parking Operations Demo | SPM ECO" }, { name: "robots", content: "noindex" }],
  }),
});
