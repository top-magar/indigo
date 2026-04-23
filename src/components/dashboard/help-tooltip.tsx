import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  content: string;
}

export function HelpTooltip({ content }: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="inline size-3.5 text-muted-foreground/50" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[200px] text-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
