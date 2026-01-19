/**
 * AI Quick Actions Toolbar
 * 
 * A floating toolbar that appears when text is selected in a block,
 * providing one-click AI actions for content improvement.
 * 
 * Design System: Vercel/Geist
 * - Purple accent for AI features (--ds-purple-*)
 * - Compact button group design (h-7/h-8)
 * - Border radius: rounded-md
 * - Shadow: shadow-md for floating toolbar
 * - Smooth animations (opacity, transform)
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Sparkles,
  Loader2,
  ChevronDown,
  Minus,
  Plus,
  Languages,
  MessageSquare,
  Check,
} from 'lucide-react';
import { cn } from '@/shared/utils';
import * as aiClient from '../api-client';
import type { ContentTone } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface AIQuickActionsProps {
  /** The container element to monitor for text selection */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Callback when content is improved */
  onContentChange: (newContent: string) => void;
  /** Current content value */
  value: string;
  /** Whether the toolbar is enabled */
  enabled?: boolean;
  /** Additional class name */
  className?: string;
}

interface Position {
  top: number;
  left: number;
  placement: 'above' | 'below';
}

type ActionType = 'improve' | 'shorter' | 'longer' | 'tone' | 'translate';

interface LoadingState {
  action: ActionType | null;
  tone?: ContentTone;
  language?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TONE_OPTIONS: { value: ContentTone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'playful', label: 'Playful' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'luxurious', label: 'Luxurious' },
];

const LANGUAGE_OPTIONS = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

const TOOLBAR_OFFSET = 8; // px from selection
const MIN_SELECTION_LENGTH = 3;

// ============================================================================
// COMPONENT
// ============================================================================

export function AIQuickActions({
  containerRef,
  onContentChange,
  value,
  enabled = true,
  className,
}: AIQuickActionsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [loading, setLoading] = useState<LoadingState>({ action: null });
  const [success, setSuccess] = useState<ActionType | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Calculate toolbar position based on selection
  const calculatePosition = useCallback((selection: Selection): Position | null => {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) return null;

    const toolbarHeight = 40; // Approximate toolbar height
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // Determine if toolbar should be above or below selection
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    const placement = spaceAbove > spaceBelow && spaceAbove > toolbarHeight + TOOLBAR_OFFSET
      ? 'above'
      : 'below';

    const top = placement === 'above'
      ? rect.top + scrollY - toolbarHeight - TOOLBAR_OFFSET
      : rect.bottom + scrollY + TOOLBAR_OFFSET;

    // Center horizontally on selection
    const left = rect.left + rect.width / 2;

    return { top, left, placement };
  }, []);

  // Handle selection changes
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.isCollapsed || !containerRef.current) {
        setIsVisible(false);
        setSelectedText('');
        return;
      }

      const text = selection.toString().trim();
      
      if (text.length < MIN_SELECTION_LENGTH) {
        setIsVisible(false);
        setSelectedText('');
        return;
      }

      // Check if selection is within our container
      const range = selection.getRangeAt(0);
      if (!containerRef.current.contains(range.commonAncestorContainer)) {
        setIsVisible(false);
        setSelectedText('');
        return;
      }

      const pos = calculatePosition(selection);
      if (pos) {
        setPosition(pos);
        setSelectedText(text);
        setIsVisible(true);
        setSuccess(null);
      }
    };

    // Debounce selection changes
    let timeoutId: NodeJS.Timeout;
    const debouncedHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleSelectionChange, 100);
    };

    document.addEventListener('selectionchange', debouncedHandler);
    
    return () => {
      document.removeEventListener('selectionchange', debouncedHandler);
      clearTimeout(timeoutId);
    };
  }, [enabled, containerRef, calculatePosition]);

  // Hide toolbar on scroll or click outside
  useEffect(() => {
    if (!isVisible) return;

    const handleHide = (e: Event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        // Small delay to allow button clicks to register
        setTimeout(() => {
          const selection = window.getSelection();
          if (!selection || selection.isCollapsed) {
            setIsVisible(false);
          }
        }, 100);
      }
    };

    const handleScroll = () => {
      setIsVisible(false);
    };

    document.addEventListener('mousedown', handleHide);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleHide);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isVisible]);

  // Replace selected text in the original content
  const replaceSelectedText = useCallback((newText: string) => {
    if (!selectedText || !value) return;
    
    const newContent = value.replace(selectedText, newText);
    onContentChange(newContent);
    
    // Clear selection
    window.getSelection()?.removeAllRanges();
    setIsVisible(false);
  }, [selectedText, value, onContentChange]);

  // AI Action handlers
  const handleImprove = useCallback(async () => {
    if (!selectedText || loading.action) return;
    
    setLoading({ action: 'improve' });
    try {
      const result = await aiClient.improveContent(selectedText, 'engagement');
      if (result.success && result.improvedContent) {
        replaceSelectedText(result.improvedContent);
        setSuccess('improve');
      }
    } catch (error) {
      console.error('Failed to improve content:', error);
    } finally {
      setLoading({ action: null });
    }
  }, [selectedText, loading.action, replaceSelectedText]);

  const handleShorter = useCallback(async () => {
    if (!selectedText || loading.action) return;
    
    setLoading({ action: 'shorter' });
    try {
      const result = await aiClient.improveContent(selectedText, 'brevity');
      if (result.success && result.improvedContent) {
        replaceSelectedText(result.improvedContent);
        setSuccess('shorter');
      }
    } catch (error) {
      console.error('Failed to shorten content:', error);
    } finally {
      setLoading({ action: null });
    }
  }, [selectedText, loading.action, replaceSelectedText]);

  const handleLonger = useCallback(async () => {
    if (!selectedText || loading.action) return;
    
    setLoading({ action: 'longer' });
    try {
      // Use engagement goal to expand content
      const result = await aiClient.improveContent(
        `Expand and elaborate on this text while keeping the same meaning: "${selectedText}"`,
        'engagement'
      );
      if (result.success && result.improvedContent) {
        replaceSelectedText(result.improvedContent);
        setSuccess('longer');
      }
    } catch (error) {
      console.error('Failed to expand content:', error);
    } finally {
      setLoading({ action: null });
    }
  }, [selectedText, loading.action, replaceSelectedText]);

  const handleToneChange = useCallback(async (tone: ContentTone) => {
    if (!selectedText || loading.action) return;
    
    setLoading({ action: 'tone', tone });
    try {
      // Generate new content with the specified tone
      const result = await aiClient.generateHeadline({
        existingHeadline: selectedText,
        tone,
      });
      if (result.success && result.content) {
        replaceSelectedText(result.content);
        setSuccess('tone');
      }
    } catch (error) {
      console.error('Failed to change tone:', error);
    } finally {
      setLoading({ action: null });
    }
  }, [selectedText, loading.action, replaceSelectedText]);

  const handleTranslate = useCallback(async (languageCode: string) => {
    if (!selectedText || loading.action) return;
    
    setLoading({ action: 'translate', language: languageCode });
    try {
      const result = await aiClient.translateText(selectedText, languageCode);
      if (result.success && result.translatedContent) {
        replaceSelectedText(result.translatedContent);
        setSuccess('translate');
      }
    } catch (error) {
      console.error('Failed to translate content:', error);
    } finally {
      setLoading({ action: null });
    }
  }, [selectedText, loading.action, replaceSelectedText]);

  // Don't render if not visible or no position
  if (!isVisible || !position) return null;

  const isLoading = loading.action !== null;

  const toolbar = (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="AI Quick Actions"
      className={cn(
        // Base styles
        'fixed z-50 flex items-center gap-0.5',
        'bg-[var(--ds-background-100)] border border-[var(--ds-gray-200)]',
        'rounded-lg shadow-md p-1',
        // Animation
        'animate-in fade-in-0 zoom-in-95',
        position.placement === 'above' ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2',
        'duration-150',
        className
      )}
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Improve with AI - Primary action */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleImprove}
        disabled={isLoading}
        className={cn(
          'h-7 px-2 gap-1.5 text-xs font-medium',
          'hover:bg-[var(--ds-purple-100)] hover:text-[var(--ds-purple-900)]',
          'focus-visible:ring-[var(--ds-purple-600)]',
          'transition-colors duration-150'
        )}
        aria-label="Improve with AI"
      >
        {loading.action === 'improve' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : success === 'improve' ? (
          <Check className="h-3.5 w-3.5 text-[var(--ds-green-700)]" aria-hidden="true" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-[var(--ds-purple-600)]" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">Improve</span>
      </Button>

      {/* Divider */}
      <div className="w-px h-4 bg-[var(--ds-gray-200)] mx-0.5" aria-hidden="true" />

      {/* Shorter */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShorter}
        disabled={isLoading}
        className={cn(
          'h-7 px-2 gap-1 text-xs font-medium',
          'hover:bg-[var(--ds-gray-100)]',
          'transition-colors duration-150'
        )}
        aria-label="Make shorter"
      >
        {loading.action === 'shorter' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">Shorter</span>
      </Button>

      {/* Longer */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLonger}
        disabled={isLoading}
        className={cn(
          'h-7 px-2 gap-1 text-xs font-medium',
          'hover:bg-[var(--ds-gray-100)]',
          'transition-colors duration-150'
        )}
        aria-label="Make longer"
      >
        {loading.action === 'longer' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">Longer</span>
      </Button>

      {/* Divider */}
      <div className="w-px h-4 bg-[var(--ds-gray-200)] mx-0.5" aria-hidden="true" />

      {/* Tone Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className={cn(
              'h-7 px-2 gap-1 text-xs font-medium',
              'hover:bg-[var(--ds-gray-100)]',
              'transition-colors duration-150'
            )}
            aria-label="Change tone"
          >
            {loading.action === 'tone' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">Tone</span>
            <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="min-w-[140px]">
          <DropdownMenuLabel>Change tone to</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {TONE_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleToneChange(option.value)}
              disabled={loading.action === 'tone' && loading.tone === option.value}
              className="text-xs"
            >
              {loading.action === 'tone' && loading.tone === option.value ? (
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              ) : null}
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Translate Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className={cn(
              'h-7 px-2 gap-1 text-xs font-medium',
              'hover:bg-[var(--ds-gray-100)]',
              'transition-colors duration-150'
            )}
            aria-label="Translate"
          >
            {loading.action === 'translate' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Languages className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">Translate</span>
            <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[140px]">
          <DropdownMenuLabel>Translate to</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {LANGUAGE_OPTIONS.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleTranslate(lang.code)}
              disabled={loading.action === 'translate' && loading.language === lang.code}
              className="text-xs"
            >
              {loading.action === 'translate' && loading.language === lang.code ? (
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              ) : null}
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // Render in portal to avoid z-index issues
  return createPortal(toolbar, document.body);
}

export type { ContentTone };
