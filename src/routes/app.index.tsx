import { createFileRoute } from "@tanstack/react-router";
import { DriverPage } from "@/components/parking/DriverPage";
export const Route = createFileRoute("/app/")({ component: () => <DriverPage /> });
