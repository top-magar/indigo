/**
 * AI Generate Button
 * 
 * A button component that triggers AI content generation with loading state
 * and sparkle icon to indicate AI functionality.
 * 
 * Design System: Vercel/Geist
 * - Purple accent for AI features
 * - Consistent button heights (sm=32px, md=40px, lg=48px)
 * - Accessible hit targets (min 32px)
 * - Smooth transitions (150ms)
 */

'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface AIGenerateButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  tooltip?: string;
  variant?: 'default' | 'ghost' | 'outline' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AIGenerateButton({
  onClick,
  loading = false,
  disabled = false,
  label = 'Generate with AI',
  tooltip = 'Use AI to generate content',
  variant = 'outline',
  size = 'sm',
  className,
}: AIGenerateButtonProps) {
  // Consistent sizing following Geist design system
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-sm',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-4 w-4',
  };

  const isIconOnly = variant === 'icon';

  const button = (
    <Button
      type="button"
      variant={isIconOnly ? 'ghost' : variant}
      size={isIconOnly ? 'icon' : 'sm'}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'gap-1.5 font-medium',
        'transition-all duration-150',
        isIconOnly ? 'h-8 w-8' : sizeClasses[size],
        // Default state styling
        variant === 'outline' && [
          'border-[var(--ds-gray-300)]',
          'hover:border-[var(--ds-purple-400)]',
          'hover:bg-[var(--ds-purple-100)]',
          'hover:text-[var(--ds-purple-900)]',
        ],
        variant === 'ghost' && [
          'hover:bg-[var(--ds-purple-100)]',
          'hover:text-[var(--ds-purple-900)]',
        ],
        // Loading state
        loading && 'opacity-70 cursor-wait',
        // Disabled state
        disabled && !loading && 'opacity-50 cursor-not-allowed',
        // Focus state
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-purple-600)] focus-visible:ring-offset-1',
        className
      )}
      aria-label={isIconOnly ? label : undefined}
      aria-busy={loading}
    >
      {loading ? (
        <Loader2 
          className={cn(iconSizes[size], 'animate-spin')} 
          aria-hidden="true" 
        />
      ) : (
        <Sparkles 
          className={cn(iconSizes[size], 'text-[var(--ds-purple-700)]')} 
          aria-hidden="true" 
        />
      )}
      {!isIconOnly && (
        <span>{loading ? 'Generating…' : label}</span>
      )}
    </Button>
  );

  // Wrap with tooltip if provided and not loading
  if (tooltip && !loading) {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="text-xs bg-[var(--ds-gray-1000)] text-[var(--ds-background-100)] border-0"
          >
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
