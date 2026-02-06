import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pin, PinOff } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface SessionPinningProps {
  sessionId: number;
  isPinned: boolean;
  onPinChange?: (isPinned: boolean) => void;
}

export function SessionPinning({
  sessionId,
  isPinned,
  onPinChange,
}: SessionPinningProps) {
  const [pinned, setPinned] = useState(isPinned);
  const pinMutation = trpc.integrations.sessionPinning.pinSession.useMutation();
  const unpinMutation = trpc.integrations.sessionPinning.unpinSession.useMutation();

  const handleTogglePin = async () => {
    try {
      if (pinned) {
        await unpinMutation.mutateAsync({ sessionId });
        setPinned(false);
      } else {
        await pinMutation.mutateAsync({ sessionId });
        setPinned(true);
      }
      onPinChange?.(!pinned);
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleTogglePin}
      className="gap-2"
      title={pinned ? "Unpin session" : "Pin session"}
    >
      {pinned ? (
        <PinOff className="w-4 h-4 text-yellow-500" />
      ) : (
        <Pin className="w-4 h-4" />
      )}
    </Button>
  );
}
