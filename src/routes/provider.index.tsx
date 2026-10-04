import { createFileRoute } from "@tanstack/react-router";
import { ManagementPage } from "@/components/parking/ManagementPage";
export const Route = createFileRoute("/provider/")({ component: () => <ManagementPage /> });
