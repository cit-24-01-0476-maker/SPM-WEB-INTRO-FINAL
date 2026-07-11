// Shared holder for the active presence handle so any component (e.g. the
// contact form) can flag conversion state on the current live session without
// prop-drilling. Set by the root layout, read anywhere.
import type { PresenceHandle } from "./presence";

let active: PresenceHandle | null = null;

export function setActivePresence(handle: PresenceHandle | null) {
  active = handle;
}

export function presenceMarkContactStarted() {
  active?.markContactFormStarted();
}

export function presenceMarkContactSubmitted() {
  active?.markContactFormSubmitted();
}

export function presenceMarkEvent(event: string) {
  active?.markEvent(event);
}
