import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tab {
  value: string;
  label: string;
}

interface MobileTabMenuProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export default function MobileTabMenu({
  tabs,
  activeTab,
  onTabChange,
}: MobileTabMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeLabel = tabs.find((t) => t.value === activeTab)?.label || "Menu";

  return (
    <div className="md:hidden w-full">
      <div className="flex items-center justify-between gap-2 p-2 bg-background border-b">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{activeLabel}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg z-20 max-h-96 overflow-y-auto">
          <div className="flex flex-col gap-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  onTabChange(tab.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.value
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
