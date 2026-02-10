/**
 * SubsidiaryFilter — Dropdown to filter business data by Canryn Production subsidiary
 * Used across all business operation pages
 */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUBSIDIARIES = [
  { value: "all", label: "All Subsidiaries" },
  { value: "canryn_production", label: "Canryn Production (Parent)" },
  { value: "rockin_rockin_boogie", label: "Rockin' Rockin' Boogie" },
  { value: "sweet_miracles", label: "Sweet Miracles Foundation" },
  { value: "hybridcast", label: "HybridCast" },
  { value: "legacy_restored", label: "Legacy Restored" },
  { value: "legacy_continues", label: "Legacy Continues" },
];

interface SubsidiaryFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SubsidiaryFilter({ value, onChange, className }: SubsidiaryFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-[240px] ${className ?? ""}`} aria-label="Filter by subsidiary">
        <SelectValue placeholder="All Subsidiaries" />
      </SelectTrigger>
      <SelectContent>
        {SUBSIDIARIES.map((sub) => (
          <SelectItem key={sub.value} value={sub.value}>
            {sub.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { SUBSIDIARIES };
