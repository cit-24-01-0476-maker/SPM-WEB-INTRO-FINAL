import { useCallback, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { demoRepository } from "./repository";
import type { Action } from "./service";
export function useParking() {
  const state = useSyncExternalStore(
    demoRepository.subscribe,
    demoRepository.getSnapshot,
    demoRepository.getServerSnapshot,
  );
  const run = useCallback(async (action: Action, success?: string): Promise<boolean> => {
    try {
      await demoRepository.execute(action);
      if (success) toast.success(success);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Demo action failed. Try again.");
      return false;
    }
  }, []);
  return { state, run };
}
