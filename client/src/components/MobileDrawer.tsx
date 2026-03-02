import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  title,
  children,
}: MobileDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card rounded-t-lg shadow-lg z-50 md:hidden max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">{children}</div>
      </div>
    </>
  );
}
