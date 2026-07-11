// Cross-tab publish notifications.
//
// Firestore onSnapshot already pushes published changes to every open tab in
// real time, so this is a belt-and-braces signal: it lets tabs drop any stale
// last-known-good cache immediately after a publish, even before the snapshot
// arrives. Safe no-op when BroadcastChannel is unavailable (SSR / old browsers).

export const CMS_CHANNEL = "spm-cms-updates";

export interface CmsPublishMessage {
  type: "PUBLICATION_COMPLETED";
  resourceType: "setting" | "page" | "section";
  resourceId: string;
  version: number;
  timestamp: number;
}

export function broadcastPublish(resourceId: string, version: number): void {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
  try {
    const ch = new BroadcastChannel(CMS_CHANNEL);
    const msg: CmsPublishMessage = {
      type: "PUBLICATION_COMPLETED",
      resourceType: "setting",
      resourceId,
      version,
      timestamp: Date.now(),
    };
    ch.postMessage(msg);
    ch.close();
  } catch {
    /* non-fatal */
  }
}

/** Subscribe to publish notifications from other tabs. Returns an unsubscribe. */
export function onPublish(handler: (msg: CmsPublishMessage) => void): () => void {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return () => {};
  const ch = new BroadcastChannel(CMS_CHANNEL);
  const listener = (e: MessageEvent<CmsPublishMessage>) => {
    if (e.data?.type === "PUBLICATION_COMPLETED") handler(e.data);
  };
  ch.addEventListener("message", listener);
  return () => {
    ch.removeEventListener("message", listener);
    ch.close();
  };
}
