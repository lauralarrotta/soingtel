import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { HelpCircle } from "lucide-react";

interface TooltipInfoProps {
  content: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function TooltipInfo({ content, side = "top" }: TooltipInfoProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="inline-flex items-center">
            <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side}>
          <p className="max-w-xs text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
