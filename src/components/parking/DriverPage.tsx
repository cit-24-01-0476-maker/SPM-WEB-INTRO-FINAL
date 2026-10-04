import { useEffect } from "react";
import { useParking } from "@/lib/parking/useParking";
import { DriverAuth, VehiclesPage, ProfilePage } from "./DriverAccount";
import { DriverDashboard } from "./DriverDashboard";
import { ParkingSearch, FacilityDetails } from "./ParkingSearch";
import { BookingsPage, WalletPage, HistoryPage } from "./BookingWallet";
import { NavigationPage } from "./NavigationPage";
import { SessionPage } from "./SessionPage";
import { SmartAssistant } from "./SmartAssistant";
import { CampusDemo } from "./CampusDemo";
import { Empty } from "./ui";
import { activeSession } from "@/lib/parking/service";
function FindCar() {
  const { state, run } = useParking();
  const session = activeSession(state);
  useEffect(() => {
    if (session && state.navigation?.mode !== "FIND_CAR") void run({ type: "FIND_CAR" });
  }, [session, state.navigation?.mode, run]);
  return session ? (
    <NavigationPage />
  ) : (
    <Empty
      title="No parked vehicle"
      description="Start a parking session to use Find My Car."
      href="/app/parking"
    />
  );
}
export function DriverPage({
  page = "dashboard",
  facilityId,
  bookingId,
}: {
  page?: string;
  facilityId?: string;
  bookingId?: string;
}) {
  const { state } = useParking();
  if (["login", "register", "forgot-password"].includes(page)) return <DriverAuth mode={page} />;
  if (page === "demo") return <CampusDemo />;
  if (!state.currentDriverId) return <DriverAuth />;
  if (facilityId) return <FacilityDetails id={facilityId} />;
  if (bookingId) return <BookingsPage bookingId={bookingId} />;
  const views: Record<string, React.ReactNode> = {
    dashboard: <DriverDashboard />,
    vehicles: <VehiclesPage />,
    parking: <ParkingSearch />,
    bookings: <BookingsPage />,
    wallet: <WalletPage />,
    history: <HistoryPage />,
    navigation: <NavigationPage />,
    session: <SessionPage />,
    "find-car": <FindCar />,
    assistant: <SmartAssistant />,
    profile: <ProfilePage />,
  };
  return (
    views[page] ?? (
      <Empty
        title="Page not found"
        description="Choose a driver feature from the navigation."
        href="/app"
        label="Driver overview"
      />
    )
  );
}
