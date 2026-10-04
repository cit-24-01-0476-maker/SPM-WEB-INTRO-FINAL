import { createFileRoute } from "@tanstack/react-router";
import { DriverPage } from "@/components/parking/DriverPage";
export const Route = createFileRoute("/app/$page")({ component: Page });
function Page() {
  const { page } = Route.useParams();
  return <DriverPage key={page} page={page} />;
}
