import { createFileRoute } from "@tanstack/react-router";
import { FacilityManager } from "@/components/parking/FacilityManager";
export const Route = createFileRoute("/provider/facilities/$id")({ component: Page });
function Page() {
  const { id } = Route.useParams();
  return <FacilityManager key={id} facilityId={id} />;
}
