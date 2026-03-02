import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Undo2, Redo2 } from "lucide-react";

interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  undoCount?: number;
  redoCount?: number;
}

export const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  undoCount = 0,
  redoCount = 0,
}) => {
  return (
    <div className="flex gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="gap-2"
          >
            <Undo2 className="w-4 h-4" />
            {undoCount > 0 && <span className="text-xs">{undoCount}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Undo (Ctrl+Z) {undoCount > 0 && `- ${undoCount} actions available`}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="gap-2"
          >
            <Redo2 className="w-4 h-4" />
            {redoCount > 0 && <span className="text-xs">{redoCount}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Redo (Ctrl+Y) {redoCount > 0 && `- ${redoCount} actions available`}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default UndoRedoControls;
