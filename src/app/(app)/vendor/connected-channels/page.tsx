import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { ConnectedChannelsClient } from "./ConnectedChannelsClient";

export default function ConnectedChannelsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading connected channels…
        </div>
      }
    >
      <ConnectedChannelsClient />
    </Suspense>
  );
}
