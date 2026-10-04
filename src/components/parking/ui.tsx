import type { ReactNode } from "react";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
export function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { tt } = useLanguage();
  return (
    <article className={`parking-panel ${className}`}>
      {title && <h2>{tt(title)}</h2>}
      {children}
    </article>
  );
}
export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const { tt } = useLanguage();
  return (
    <div className="parking-page-title">
      <div>
        <p className="eco-eyebrow">SPM ECO · {tt("Software prototype")}</p>
        <h1>{tt(title)}</h1>
        <p>{tt(description)}</p>
      </div>
      {action}
    </div>
  );
}
export function Status({ value }: { value: string }) {
  const { tt } = useLanguage();
  return (
    <span className={`parking-status status-${value.toLowerCase()}`}>
      {tt(value.replaceAll("_", " "))}
    </span>
  );
}
export function Empty({
  title,
  description,
  href,
  label,
}: {
  title: string;
  description: string;
  href?: string;
  label?: string;
}) {
  const { tt } = useLanguage();
  return (
    <div className="parking-empty">
      <AlertCircle size={30} />
      <h3>{tt(title)}</h3>
      <p>{tt(description)}</p>
      {href && (
        <a href={href} className="eco-button">
          {tt(label ?? "Find Parking")}
          <ArrowRight size={16} />
        </a>
      )}
    </div>
  );
}
export function Field({ label, children }: { label: string; children: ReactNode }) {
  const { tt } = useLanguage();
  return (
    <label className="parking-field">
      <span>{tt(label)}</span>
      {children}
    </label>
  );
}
export function Stat({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  const { tt } = useLanguage();
  return (
    <article className="parking-stat">
      <p>{tt(label)}</p>
      <strong>{value}</strong>
      {note && <small>{tt(note)}</small>}
    </article>
  );
}
export function Hint({ children }: { children: ReactNode }) {
  return <p className="parking-hint">{children}</p>;
}
