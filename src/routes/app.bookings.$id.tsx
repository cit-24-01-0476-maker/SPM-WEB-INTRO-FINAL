import { createFileRoute } from "@tanstack/react-router";
import { DriverPage } from "@/components/parking/DriverPage";
export const Route = createFileRoute("/app/bookings/$id")({ component: Page });
function Page() {
  const { id } = Route.useParams();
  return <DriverPage key={id} bookingId={id} />;
}
