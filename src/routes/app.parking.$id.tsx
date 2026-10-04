import { createFileRoute } from "@tanstack/react-router";
import { DriverPage } from "@/components/parking/DriverPage";
export const Route = createFileRoute("/app/parking/$id")({ component: Page });
function Page() {
  const { id } = Route.useParams();
  return <DriverPage key={id} facilityId={id} />;
}
