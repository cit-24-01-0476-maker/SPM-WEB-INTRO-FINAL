import { ManagementDashboard } from "./ManagementDashboard";
import { ManagementData, ManagementSettings, SlotsManager } from "./ManagementData";
import { FacilityManager } from "./FacilityManager";
import { MapEditor } from "./MapEditor";
import { Empty } from "./ui";
export function ManagementPage({
  page = "dashboard",
  operations = false,
}: {
  page?: string;
  operations?: boolean;
}) {
  if (page === "dashboard") return <ManagementDashboard operations={operations} />;
  if (page === "facilities" || page === "pricing" || page === "register")
    return (
      <FacilityManager
        operations={operations}
        pricingOnly={page === "pricing"}
        register={page === "register"}
      />
    );
  if (page === "map") return <MapEditor operations={operations} />;
  if (page === "slots") return <SlotsManager operations={operations} />;
  if (page === "settings") return <ManagementSettings operations={operations} />;
  if (
    [
      "bookings",
      "sessions",
      "transactions",
      "reports",
      ...(operations ? ["drivers", "providers", "verifications"] : []),
    ].includes(page)
  )
    return <ManagementData page={page} operations={operations} />;
  return (
    <Empty
      title="Page not found"
      description="Choose a management feature from the navigation."
      href={operations ? "/parking-admin" : "/provider"}
      label="Overview"
    />
  );
}
