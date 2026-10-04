import { createFileRoute } from "@tanstack/react-router";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Contact } from "@/components/site/Contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | SPM ECO System" },
      {
        name: "description",
        content:
          "Get in touch with the SPM ECO System team to discuss the smart parking management platform for your facility, retail chain, or multi-location operation in Sri Lanka.",
      },
      { property: "og:title", content: "Contact | SPM ECO System" },
      {
        property: "og:description",
        content:
          "Learn about SPM ECO System's smart parking platform for your facility, retail chain, or multi-location operation.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  useScrollReveal();
  return (
    <div className="pt-20">
      <Contact />
    </div>
  );
}
