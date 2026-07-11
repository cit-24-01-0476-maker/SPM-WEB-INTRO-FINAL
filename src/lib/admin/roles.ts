import type { AppRole } from "./auth";

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Administrator",
  content_editor: "Content Editor",
  analytics_viewer: "Analytics Viewer",
  inquiry_manager: "Inquiry Manager",
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  super_admin: "Full A–Z access to the entire admin panel.",
  content_editor: "Edit website text, media, pages and sections. Cannot manage admins or security.",
  analytics_viewer: "View reports, traffic and visitor locations. Cannot edit content.",
  inquiry_manager: "View and manage contact form submissions and inquiry notes.",
};

export const ALL_ROLES: AppRole[] = [
  "super_admin",
  "content_editor",
  "analytics_viewer",
  "inquiry_manager",
];

export const INQUIRY_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "in_progress",
  "completed",
  "closed",
  "spam",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
  spam: "Spam",
};
