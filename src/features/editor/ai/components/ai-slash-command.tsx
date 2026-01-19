/**
 * AI Slash Command
 * 
 * A slash command component for AI-powered text generation in the visual editor.
 * Detects "/" in text fields and shows a dropdown menu with AI options.
 * 
 * Design System: Vercel/Geist
 * - Purple accent for AI features (--ds-purple-*)
 * - Button heights: sm=h-8, md=h-10
 * - Border radius: rounded-md for interactive elements, rounded-lg for dropdowns
 * - Accessible keyboard navigation
 */

'use client';

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from '@/components/ui/popover';
import {
  Sparkles,
  Loader2,
  Wand2,
  Languages,
  Minimize2,
  Maximize2,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/shared/utils';
import * as aiClient from '../api-client';
import type { ImprovementGoal } from '../api-client';
import type { ContentTone } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface AISlashCommandProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  multiline?: boolean;
  rows?: number;
  aiContext?: {
    storeName?: string;
    productName?: string;
    industry?: string;
    tone?: ContentTone;
  };
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action?: () => Promise<void>;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
  description?: string;
  action: () => Promise<void>;
}

type MenuState = 'main' | 'generate' | 'improve';

// ============================================================================
// COMPONENT
// ============================================================================

export const AISlashCommand = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  AISlashCommandProps
>(function AISlashCommand(
  {
    label,
    value,
    onChange,
    placeholder,
    description,
    multiline = false,
    rows = 3,
    aiContext = {},
    className,
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuState, setMenuState] = useState<MenuState>('main');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [slashPosition, setSlashPosition] = useState<number | null>(null);
  
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const tone = aiContext.tone || 'professional';

  // ============================================================================
  // AI ACTIONS
  // ============================================================================

  const removeSlashAndApply = useCallback((content: string) => {
    if (slashPosition !== null) {
      const before = value.slice(0, slashPosition);
      const after = value.slice(slashPosition + 1);
      onChange(before + content + after);
    } else {
      onChange(content);
    }
    setIsOpen(false);
    setMenuState('main');
    setSelectedIndex(0);
    setSlashPosition(null);
  }, [value, slashPosition, onChange]);

  const handleGenerateHeadline = useCallback(async () => {
    setIsLoading(true);
    setLoadingAction('headline');
    try {
      const result = await aiClient.generateHeadline({
        storeName: aiContext.storeName,
        industry: aiContext.industry,
        productName: aiContext.productName,
        tone,
      });
      if (result.success && result.content) {
        removeSlashAndApply(result.content);
      }
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }, [aiContext, tone, removeSlashAndApply]);

  const handleGenerateDescription = useCallback(async () => {
    setIsLoading(true);
    setLoadingAction('description');
    try {
      const result = await aiClient.generateDescription({
        productName: aiContext.productName,
        tone,
        maxLength: 300,
      });
      if (result.success && result.content) {
        removeSlashAndApply(result.content);
      }
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }, [aiContext, tone, removeSlashAndApply]);

  const handleGenerateCTA = useCallback(async () => {
    setIsLoading(true);
    setLoadingAction('cta');
    try {
      const result = await aiClient.generateCTA({
        action: 'shop',
        urgency: false,
        tone,
      });
      if (result.success && result.content) {
        removeSlashAndApply(result.content);
      }
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }, [tone, removeSlashAndApply]);

  const handleImprove = useCallback(async (goal: ImprovementGoal) => {
    if (!value || value.length < 5) return;
    
    setIsLoading(true);
    setLoadingAction(goal);
    try {
      const contentToImprove = slashPosition !== null 
        ? value.slice(0, slashPosition) + value.slice(slashPosition + 1)
        : value;
      
      const result = await aiClient.improveContent(contentToImprove, goal);
      if (result.success && result.improvedContent) {
        onChange(result.improvedContent);
        setIsOpen(false);
        setMenuState('main');
        setSelectedIndex(0);
        setSlashPosition(null);
      }
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }, [value, slashPosition, onChange]);

  const handleTranslate = useCallback(async () => {
    if (!value || value.length < 5) return;
    
    setIsLoading(true);
    setLoadingAction('translate');
    try {
      const contentToTranslate = slashPosition !== null 
        ? value.slice(0, slashPosition) + value.slice(slashPosition + 1)
        : value;
      
      // Default to Spanish for demo - in production, show language picker
      const result = await aiClient.translateText(contentToTranslate, 'es');
      if (result.success && result.translatedContent) {
        onChange(result.translatedContent);
        setIsOpen(false);
        setMenuState('main');
        setSelectedIndex(0);
        setSlashPosition(null);
      }
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }, [value, slashPosition, onChange]);

  const handleMakeShorter = useCallback(async () => {
    await handleImprove('brevity');
  }, [handleImprove]);

  const handleMakeLonger = useCallback(async () => {
    if (!value || value.length < 5) return;
    
    setIsLoading(true);
    setLoadingAction('longer');
    try {
      const contentToExpand = slashPosition !== null 
        ? value.slice(0, slashPosition) + value.slice(slashPosition + 1)
        : value;
      
      const result = await aiClient.improveContent(contentToExpand, 'engagement');
      if (result.success && result.improvedContent) {
        onChange(result.improvedContent);
        setIsOpen(false);
        setMenuState('main');
        setSelectedIndex(0);
        setSlashPosition(null);
      }
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }, [value, slashPosition, onChange]);

  const handleFixGrammar = useCallback(async () => {
    await handleImprove('grammar');
  }, [handleImprove]);

  // ============================================================================
  // MENU ITEMS
  // ============================================================================

  const mainMenuItems: MenuItem[] = [
    {
      id: 'generate',
      label: 'Generate content',
      description: 'Create new text with AI',
      icon: <Sparkles className="h-4 w-4" />,
      subItems: [
        {
          id: 'headline',
          label: 'Headline',
          description: 'Generate an attention-grabbing headline',
          action: handleGenerateHeadline,
        },
        {
          id: 'description',
          label: 'Description',
          description: 'Generate a product or section description',
          action: handleGenerateDescription,
        },
        {
          id: 'cta',
          label: 'Call to action',
          description: 'Generate a compelling CTA button text',
          action: handleGenerateCTA,
        },
      ],
    },
    {
      id: 'improve',
      label: 'Improve',
      description: 'Enhance existing content',
      icon: <Wand2 className="h-4 w-4" />,
      subItems: [
        {
          id: 'clarity',
          label: 'Clarity',
          description: 'Make it clearer and easier to understand',
          action: () => handleImprove('clarity'),
        },
        {
          id: 'engagement',
          label: 'Engagement',
          description: 'Make it more compelling',
          action: () => handleImprove('engagement'),
        },
        {
          id: 'seo',
          label: 'SEO',
          description: 'Optimize for search engines',
          action: () => handleImprove('seo'),
        },
        {
          id: 'brevity',
          label: 'Brevity',
          description: 'Make it more concise',
          action: () => handleImprove('brevity'),
        },
      ],
    },
    {
      id: 'translate',
      label: 'Translate',
      description: 'Translate to another language',
      icon: <Languages className="h-4 w-4" />,
      action: handleTranslate,
    },
    {
      id: 'shorter',
      label: 'Make shorter',
      description: 'Condense the content',
      icon: <Minimize2 className="h-4 w-4" />,
      action: handleMakeShorter,
    },
    {
      id: 'longer',
      label: 'Make longer',
      description: 'Expand the content',
      icon: <Maximize2 className="h-4 w-4" />,
      action: handleMakeLonger,
    },
    {
      id: 'grammar',
      label: 'Fix grammar',
      description: 'Correct spelling and grammar',
      icon: <CheckCircle className="h-4 w-4" />,
      action: handleFixGrammar,
    },
  ];

  const getCurrentMenuItems = useCallback((): MenuItem[] | SubMenuItem[] => {
    if (menuState === 'main') {
      return mainMenuItems;
    }
    const parentItem = mainMenuItems.find(item => item.id === menuState);
    return parentItem?.subItems || [];
  }, [menuState, mainMenuItems]);

  const currentItems = getCurrentMenuItems();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    
    onChange(newValue);

    // Check if "/" was just typed
    if (newValue[cursorPosition - 1] === '/') {
      setSlashPosition(cursorPosition - 1);
      setIsOpen(true);
      setMenuState('main');
      setSelectedIndex(0);
    } else if (isOpen) {
      // Close menu if user types something else after "/"
      const textAfterSlash = slashPosition !== null 
        ? newValue.slice(slashPosition + 1, cursorPosition)
        : '';
      
      if (textAfterSlash.length > 0 && !textAfterSlash.startsWith(' ')) {
        setIsOpen(false);
        setSlashPosition(null);
      }
    }
  }, [onChange, isOpen, slashPosition]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < currentItems.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : currentItems.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        const selectedItem = currentItems[selectedIndex];
        if (selectedItem) {
          if ('subItems' in selectedItem && selectedItem.subItems) {
            setMenuState(selectedItem.id as MenuState);
            setSelectedIndex(0);
          } else if ('action' in selectedItem && selectedItem.action) {
            selectedItem.action();
          }
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        if (menuState !== 'main') {
          setMenuState('main');
          setSelectedIndex(0);
        } else {
          setIsOpen(false);
          setSlashPosition(null);
        }
        break;
      
      case 'Backspace':
        if (menuState !== 'main') {
          e.preventDefault();
          setMenuState('main');
          setSelectedIndex(0);
        }
        break;
    }
  }, [isOpen, currentItems, selectedIndex, menuState]);

  const handleItemClick = useCallback((item: MenuItem | SubMenuItem) => {
    if ('subItems' in item && item.subItems) {
      setMenuState(item.id as MenuState);
      setSelectedIndex(0);
    } else if ('action' in item && item.action) {
      item.action();
    }
  }, []);

  const handleBackClick = useCallback(() => {
    setMenuState('main');
    setSelectedIndex(0);
  }, []);

  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const selectedElement = menuRef.current.querySelector('[data-selected="true"]');
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSlashPosition(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const InputComponent = multiline ? Textarea : Input;

  const renderMenuItem = (item: MenuItem | SubMenuItem, index: number) => {
    const isSelected = index === selectedIndex;
    const hasSubItems = 'subItems' in item && item.subItems;
    const itemLoadingAction = 'id' in item ? item.id : null;
    const isItemLoading = isLoading && loadingAction === itemLoadingAction;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleItemClick(item)}
        disabled={isLoading}
        data-selected={isSelected}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left',
          'transition-colors duration-150',
          'focus:outline-none',
          isSelected 
            ? 'bg-[var(--ds-purple-100)] text-[var(--ds-gray-1000)]' 
            : 'text-[var(--ds-gray-800)] hover:bg-[var(--ds-gray-100)]',
          isLoading && !isItemLoading && 'opacity-50 cursor-not-allowed'
        )}
        aria-selected={isSelected}
        role="option"
      >
        <span className={cn(
          'flex-shrink-0',
          isSelected ? 'text-[var(--ds-purple-700)]' : 'text-[var(--ds-gray-600)]'
        )}>
          {'icon' in item ? item.icon : <Wand2 className="h-4 w-4" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{item.label}</div>
          {'description' in item && item.description && (
            <div className="text-xs text-[var(--ds-gray-600)] truncate">
              {item.description}
            </div>
          )}
        </div>
        {isItemLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[var(--ds-purple-600)]" />
        ) : hasSubItems ? (
          <ChevronRight className="h-4 w-4 text-[var(--ds-gray-500)]" />
        ) : null}
      </button>
    );
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label className="text-xs font-medium text-[var(--ds-gray-700)]">
          {label}
        </Label>
      )}

      {description && (
        <p className="text-[10px] text-[var(--ds-gray-500)]">{description}</p>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverAnchor asChild>
          <InputComponent
            ref={(el: HTMLInputElement | HTMLTextAreaElement | null) => {
              inputRef.current = el;
              if (typeof ref === 'function') {
                ref(el);
              } else if (ref) {
                ref.current = el;
              }
            }}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Type "/" for AI commands…'}
            className={cn(
              'text-sm',
              multiline ? '' : 'h-10'
            )}
            rows={multiline ? rows : undefined}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? 'ai-slash-menu' : undefined}
          />
        </PopoverAnchor>

        <PopoverContent
          ref={menuRef}
          align="start"
          side="bottom"
          sideOffset={4}
          className={cn(
            'w-72 p-1.5',
            'border border-[var(--ds-purple-200)]',
            'bg-[var(--ds-background-100)]',
            'shadow-lg rounded-lg'
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
          id="ai-slash-menu"
          role="listbox"
          aria-label="AI commands"
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            {menuState !== 'main' && (
              <button
                type="button"
                onClick={handleBackClick}
                className={cn(
                  'p-1 rounded-md',
                  'hover:bg-[var(--ds-gray-100)]',
                  'transition-colors duration-150'
                )}
                aria-label="Go back"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[var(--ds-gray-600)]" />
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[var(--ds-purple-600)]" />
              <span className="text-xs font-medium text-[var(--ds-gray-900)]">
                {menuState === 'main' 
                  ? 'AI Commands' 
                  : menuState === 'generate' 
                    ? 'Generate' 
                    : 'Improve'}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-0.5" role="group">
            {currentItems.map((item, index) => renderMenuItem(item, index))}
          </div>

          {/* Footer hint */}
          <div className="mt-2 px-2 py-1.5 border-t border-[var(--ds-gray-200)]">
            <p className="text-[10px] text-[var(--ds-gray-500)]">
              ↑↓ to navigate • Enter to select • Esc to close
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

export type { MenuItem, SubMenuItem, MenuState };
