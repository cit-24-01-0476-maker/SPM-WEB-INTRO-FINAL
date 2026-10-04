import { createFileRoute } from "@tanstack/react-router";
import { ManagementPage } from "@/components/parking/ManagementPage";
export const Route = createFileRoute("/provider/$page")({ component: Page });
function Page() {
  const { page } = Route.useParams();
  return <ManagementPage key={page} page={page} />;
}
