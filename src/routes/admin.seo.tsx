import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ComingSoon } from "@/components/admin/primitives";

export const Route = createFileRoute("/admin/seo")({
  component: () => (
    <ComingSoon
      title="SEO Manager"
      description="Manage per-page SEO metadata with a search-result preview."
      icon={Search}
      points={[
        "SEO title & meta description",
        "Keywords & canonical URL",
        "Open Graph & Twitter preview",
        "Indexing & sitemap visibility",
        "URL slug",
        "Desktop & mobile SERP preview",
      ]}
    />
  ),
});
