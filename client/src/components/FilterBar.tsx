import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: {
    label: string;
    options: FilterOption[];
    onSelect: (value: string) => void;
    selected?: string;
  }[];
  className?: string;
}

export function FilterBar({ filters, className = '' }: FilterBarProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {filters.map((filter) => (
        <div key={filter.label} className="relative">
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-slate-700 border-slate-600 text-slate-300 hover:text-white"
            onClick={() =>
              setOpenFilter(
                openFilter === filter.label ? null : filter.label
              )
            }
          >
            {filter.label}
            {filter.selected && (
              <span className="text-amber-400 font-semibold">
                : {filter.selected}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </Button>

          {openFilter === filter.label && (
            <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 min-w-48">
              {filter.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    filter.onSelect(option.value);
                    setOpenFilter(null);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-700 transition-colors ${
                    filter.selected === option.value
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
