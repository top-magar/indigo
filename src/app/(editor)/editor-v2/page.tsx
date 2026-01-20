'use client';

/**
 * Visual Editor V2 - Main Editor Page
 * 
 * A Figma/Framer-like visual editor with:
 * - Left sidebar: Layers Panel (element tree navigation)
 * - Center: Infinite Canvas with pan/zoom
 * - Right sidebar: Properties Panel (element property editing)
 * - Bottom/floating: AI Chat Panel for conversational AI page generation
 */

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Layers,
  Settings2,
  Sparkles,
  Save,
  ExternalLink,
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  MoreHorizontal,
  Trash2,
  Copy,
  Plus,
  X,
  Send,
  Loader2,
} from 'lucide-react';
import { cn } from '@/shared/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Kbd } from '@/components/ui/kbd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Canvas,
  useEditorStoreV2,
  createPage,
  type VisualElement,
  type Page,
  type Breakpoint,
} from '@/features/visual-editor-v2';

// ============================================================================
// LAYERS PANEL (Placeholder - will be extracted later)
// ============================================================================

interface LayersPanelProps {
  page: Page | null;
  selectedIds: string[];
  hoveredId: string | null;
  onSelect: (elementId: string | null, mode?: 'replace' | 'add' | 'toggle') => void;
  onHover: (elementId: string | null) => void;
  onToggleVisibility: (elementId: string) => void;
  onToggleLock: (elementId: string) => void;
  onDelete: (elementId: string) => void;
  onDuplicate: (elementId: string) => void;
}

function LayersPanel({
  page,
  selectedIds,
  hoveredId,
  onSelect,
  onHover,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onDuplicate,
}: LayersPanelProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = useCallback((elementId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(elementId)) {
        next.delete(elementId);
      } else {
        next.add(elementId);
      }
      return next;
    });
  }, []);

  const renderElement = useCallback(
    (elementId: string, depth: number = 0) => {
      if (!page) return null;
      const element = page.elements[elementId];
      if (!element) return null;

      const isSelected = selectedIds.includes(elementId);
      const isHovered = hoveredId === elementId;
      const isExpanded = expandedIds.has(elementId);
      const hasChildren = element.children.length > 0;
      const isRoot = elementId === page.rootElementId;

      return (
        <div key={elementId}>
          <div
            className={cn(
              'group flex items-center gap-1 px-2 py-1.5 text-sm cursor-pointer',
              'hover:bg-[var(--ds-gray-100)] transition-colors',
              isSelected && 'bg-[var(--ds-blue-100)] hover:bg-[var(--ds-blue-100)]',
              isHovered && !isSelected && 'bg-[var(--ds-gray-50)]',
              element.hidden && 'opacity-50'
            )}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={(e) => {
              e.stopPropagation();
              const mode = e.shiftKey ? 'add' : e.metaKey || e.ctrlKey ? 'toggle' : 'replace';
              onSelect(elementId, mode);
            }}
            onMouseEnter={() => onHover(elementId)}
            onMouseLeave={() => onHover(null)}
          >
            {/* Expand/Collapse */}
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(elementId);
                }}
                className="p-0.5 hover:bg-[var(--ds-gray-200)] rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-[var(--ds-gray-500)]" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-[var(--ds-gray-500)]" />
                )}
              </button>
            ) : (
              <span className="w-4" />
            )}

            {/* Element name */}
            <span
              className={cn(
                'flex-1 truncate text-[var(--ds-gray-800)]',
                isSelected && 'text-[var(--ds-blue-700)] font-medium'
              )}
            >
              {element.name}
            </span>

            {/* Actions (visible on hover) */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Visibility toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(elementId);
                }}
                className="p-1 hover:bg-[var(--ds-gray-200)] rounded"
                title={element.hidden ? 'Show' : 'Hide'}
              >
                {element.hidden ? (
                  <EyeOff className="h-3 w-3 text-[var(--ds-gray-400)]" />
                ) : (
                  <Eye className="h-3 w-3 text-[var(--ds-gray-500)]" />
                )}
              </button>

              {/* Lock toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLock(elementId);
                }}
                className="p-1 hover:bg-[var(--ds-gray-200)] rounded"
                title={element.locked ? 'Unlock' : 'Lock'}
              >
                {element.locked ? (
                  <Lock className="h-3 w-3 text-[var(--ds-gray-400)]" />
                ) : (
                  <Unlock className="h-3 w-3 text-[var(--ds-gray-500)]" />
                )}
              </button>

              {/* More actions */}
              {!isRoot && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 hover:bg-[var(--ds-gray-200)] rounded"
                    >
                      <MoreHorizontal className="h-3 w-3 text-[var(--ds-gray-500)]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onDuplicate(elementId)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(elementId)}
                      className="text-[var(--ds-red-600)]"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div>
              {element.children.map((childId) => renderElement(childId, depth + 1))}
            </div>
          )}
        </div>
      );
    },
    [page, selectedIds, hoveredId, expandedIds, toggleExpanded, onSelect, onHover, onToggleVisibility, onToggleLock, onDelete, onDuplicate]
  );

  // Auto-expand root on mount
  useEffect(() => {
    if (page?.rootElementId) {
      setExpandedIds(new Set([page.rootElementId]));
    }
  }, [page?.rootElementId]);

  return (
    <div className="h-full w-full flex flex-col bg-[var(--ds-background-100)] border-r border-[var(--ds-gray-200)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--ds-gray-200)]">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[var(--ds-gray-600)]" />
          <span className="text-sm font-medium text-[var(--ds-gray-900)]">Layers</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="h-7 w-7">
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent variant="geist" side="bottom">
            Add element
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Element tree */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {page?.rootElementId && renderElement(page.rootElementId)}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================================================
// PROPERTIES PANEL (Placeholder - will be extracted later)
// ============================================================================

interface PropertiesPanelProps {
  element: VisualElement | null;
  onUpdate: (updates: Partial<VisualElement>) => void;
}

function PropertiesPanel({ element, onUpdate }: PropertiesPanelProps) {
  if (!element) {
    return (
      <div className="h-full w-full flex flex-col bg-[var(--ds-background-100)] border-l border-[var(--ds-gray-200)]">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--ds-gray-200)]">
          <Settings2 className="h-4 w-4 text-[var(--ds-gray-600)]" />
          <span className="text-sm font-medium text-[var(--ds-gray-900)]">Properties</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-[var(--ds-gray-500)] text-center">
            Select an element to edit its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-[var(--ds-background-100)] border-l border-[var(--ds-gray-200)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--ds-gray-200)]">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-[var(--ds-gray-600)]" />
          <span className="text-sm font-medium text-[var(--ds-gray-900)]">Properties</span>
        </div>
        <span className="text-xs text-[var(--ds-gray-500)] bg-[var(--ds-gray-100)] px-2 py-0.5 rounded">
          {element.type}
        </span>
      </div>

      {/* Properties */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--ds-gray-600)]">Name</Label>
            <Input
              value={element.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          <Separator />

          {/* Size */}
          <div className="space-y-2">
            <Label className="text-xs text-[var(--ds-gray-600)] font-medium">Size</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-[var(--ds-gray-500)]">Width</Label>
                <Input
                  value={element.size.width === 'auto' ? 'auto' : element.size.width === 'fill' ? 'fill' : element.size.width}
                  onChange={(e) => {
                    const val = e.target.value;
                    const width = val === 'auto' ? 'auto' : val === 'fill' ? 'fill' : val === 'hug' ? 'hug' : parseInt(val) || 'auto';
                    onUpdate({ size: { ...element.size, width } });
                  }}
                  className="h-7 text-xs"
                  placeholder="auto"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-[var(--ds-gray-500)]">Height</Label>
                <Input
                  value={element.size.height === 'auto' ? 'auto' : element.size.height === 'fill' ? 'fill' : element.size.height}
                  onChange={(e) => {
                    const val = e.target.value;
                    const height = val === 'auto' ? 'auto' : val === 'fill' ? 'fill' : val === 'hug' ? 'hug' : parseInt(val) || 'auto';
                    onUpdate({ size: { ...element.size, height } });
                  }}
                  className="h-7 text-xs"
                  placeholder="auto"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Layout */}
          <div className="space-y-2">
            <Label className="text-xs text-[var(--ds-gray-600)] font-medium">Layout</Label>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-[var(--ds-gray-500)]">Display</Label>
                <select
                  value={element.layout.display}
                  onChange={(e) => onUpdate({ layout: { ...element.layout, display: e.target.value as any } })}
                  className="w-full h-7 text-xs rounded-md border border-[var(--ds-gray-300)] bg-[var(--ds-background)] px-2"
                >
                  <option value="block">Block</option>
                  <option value="flex">Flex</option>
                  <option value="grid">Grid</option>
                  <option value="none">None</option>
                </select>
              </div>
              {element.layout.display === 'flex' && (
                <>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-[var(--ds-gray-500)]">Direction</Label>
                    <select
                      value={element.layout.flexDirection || 'row'}
                      onChange={(e) => onUpdate({ layout: { ...element.layout, flexDirection: e.target.value as any } })}
                      className="w-full h-7 text-xs rounded-md border border-[var(--ds-gray-300)] bg-[var(--ds-background)] px-2"
                    >
                      <option value="row">Row</option>
                      <option value="column">Column</option>
                      <option value="row-reverse">Row Reverse</option>
                      <option value="column-reverse">Column Reverse</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-[var(--ds-gray-500)]">Gap</Label>
                    <Input
                      type="number"
                      value={element.layout.gap || 0}
                      onChange={(e) => onUpdate({ layout: { ...element.layout, gap: parseInt(e.target.value) || 0 } })}
                      className="h-7 text-xs"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Styles */}
          <div className="space-y-2">
            <Label className="text-xs text-[var(--ds-gray-600)] font-medium">Styles</Label>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-[var(--ds-gray-500)]">Background Color</Label>
                <Input
                  value={element.styles.background?.color || ''}
                  onChange={(e) => onUpdate({
                    styles: {
                      ...element.styles,
                      background: { type: 'solid', color: e.target.value },
                    },
                  })}
                  className="h-7 text-xs"
                  placeholder="var(--ds-gray-100)"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-[var(--ds-gray-500)]">Border Radius</Label>
                <Input
                  type="number"
                  value={typeof element.styles.borderRadius === 'number' ? element.styles.borderRadius : 0}
                  onChange={(e) => onUpdate({
                    styles: { ...element.styles, borderRadius: parseInt(e.target.value) || 0 },
                  })}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-[var(--ds-gray-500)]">Opacity</Label>
                <Input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={element.styles.opacity ?? 1}
                  onChange={(e) => onUpdate({
                    styles: { ...element.styles, opacity: parseFloat(e.target.value) || 1 },
                  })}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Text content */}
          {element.content?.type === 'text' && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs text-[var(--ds-gray-600)] font-medium">Content</Label>
                <Textarea
                  value={element.content.text}
                  onChange={(e) => onUpdate({
                    content: { ...element.content, text: e.target.value } as any,
                  })}
                  className="text-sm min-h-[80px]"
                  placeholder="Enter text..."
                />
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================================================
// AI CHAT PANEL (Placeholder - will be extracted later)
// ============================================================================

interface AIChatPanelV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGeneratePage?: (prompt: string) => Promise<void>;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const SUGGESTED_PROMPTS = [
  'Create a hero section with a bold headline',
  'Add a product grid with 4 columns',
  'Generate a testimonials section',
  'Create a newsletter signup form',
  'Add a features section with icons',
];

function AIChatPanelV2({ open, onOpenChange, onGeneratePage }: AIChatPanelV2Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputId = React.useId();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI generation
      if (onGeneratePage) {
        await onGeneratePage(trimmedInput);
        
        // Add success response
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `Done! I've generated the page based on your request: "${trimmedInput}". Check the canvas to see the result.`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Sorry, something went wrong while generating the page. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, onGeneratePage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleSuggestionClick = useCallback((prompt: string) => {
    setInput(prompt);
  }, []);

  if (!open) return null;

  return (
    <div
      className={cn(
        'absolute bottom-4 left-1/2 -translate-x-1/2 z-50',
        'w-[420px]',
        'bg-white border border-[var(--ds-gray-200)]',
        'rounded-xl shadow-xl overflow-hidden',
        'flex flex-col',
        // Fixed height to prevent layout issues
        messages.length > 0 ? 'h-[400px]' : 'h-auto max-h-[480px]',
        // Entrance animation
        'animate-in fade-in slide-in-from-bottom-4 duration-200'
      )}
      role="dialog"
      aria-label="AI Assistant"
      aria-busy={isLoading}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[var(--ds-gray-200)] bg-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--ds-purple-600)]" aria-hidden="true" />
          <span className="text-sm font-medium text-[var(--ds-gray-900)]">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Clear chat button - only visible when messages exist */}
          {messages.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClearChat}
                  className="h-7 w-7 text-[var(--ds-gray-500)] hover:text-[var(--ds-gray-700)]"
                  aria-label="Clear chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent variant="geist" side="bottom">
                Clear chat
              </TooltipContent>
            </Tooltip>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            className="h-7 w-7"
            aria-label="Close AI Assistant"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages area - scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div 
          className="p-4 space-y-3"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-[var(--ds-gray-500)] text-center">
                Describe the page you want to create, and I'll generate it for you.
              </p>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-[var(--ds-gray-600)]">Try these:</p>
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(prompt)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm rounded-lg',
                      'border border-[var(--ds-gray-200)]',
                      'hover:bg-[var(--ds-gray-100)] hover:border-[var(--ds-gray-300)] transition-colors',
                      'text-[var(--ds-gray-700)]'
                    )}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Chat messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex flex-col gap-1',
                    message.role === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                      message.role === 'user'
                        ? 'bg-[var(--ds-purple-600)] text-white'
                        : 'bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]'
                    )}
                  >
                    {message.content}
                  </div>
                  <span className="text-[10px] text-[var(--ds-gray-400)]">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
              
              {/* Loading state */}
              {isLoading && (
                <div className="flex items-start" aria-label="AI is generating a response">
                  <div className="bg-[var(--ds-gray-100)] rounded-lg px-3 py-2 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--ds-purple-600)]" aria-hidden="true" />
                    <span className="text-sm text-[var(--ds-gray-600)]">Generating page…</span>
                  </div>
                </div>
              )}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input - fixed at bottom */}
      <div className="flex-shrink-0 border-t border-[var(--ds-gray-200)] p-3 bg-white">
        <div className="flex gap-2">
          <Label htmlFor={inputId} className="sr-only">
            Describe your page
          </Label>
          <Textarea
            id={inputId}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your page…"
            className="min-h-[44px] max-h-[100px] resize-none text-sm flex-1"
            disabled={isLoading}
            aria-describedby={`${inputId}-hint`}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 p-0 shrink-0 bg-[var(--ds-gray-900)] hover:bg-[var(--ds-gray-1000)] disabled:bg-[var(--ds-gray-200)]"
            aria-label={isLoading ? 'Generating…' : 'Send message'}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        <p id={`${inputId}-hint`} className="text-[10px] text-[var(--ds-gray-400)] mt-1.5 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// EDITOR HEADER
// ============================================================================

interface EditorHeaderProps {
  pageName: string;
  onPageNameChange: (name: string) => void;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onPreview: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  activeBreakpoint: Breakpoint;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
  onToggleAI: () => void;
  aiOpen: boolean;
}

function EditorHeader({
  pageName,
  onPageNameChange,
  isDirty,
  isSaving,
  onSave,
  onPreview,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  activeBreakpoint,
  onBreakpointChange,
  onToggleAI,
  aiOpen,
}: EditorHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(pageName);

  const handleNameSubmit = useCallback(() => {
    if (editedName.trim()) {
      onPageNameChange(editedName.trim());
    } else {
      setEditedName(pageName);
    }
    setIsEditingName(false);
  }, [editedName, pageName, onPageNameChange]);

  return (
    <header className="h-14 border-b border-[var(--ds-gray-200)] bg-[var(--ds-background-100)] flex items-center justify-between px-4">
      {/* Left: Logo + Page name */}
      <div className="flex items-center gap-4">
        <a href="/dashboard" className="text-lg font-semibold text-[var(--ds-gray-900)]">
          Indigo
        </a>
        <Separator orientation="vertical" className="h-6" />
        {isEditingName ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSubmit();
              if (e.key === 'Escape') {
                setEditedName(pageName);
                setIsEditingName(false);
              }
            }}
            className="h-8 w-48 text-sm"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-sm font-medium text-[var(--ds-gray-800)] hover:text-[var(--ds-gray-900)] flex items-center gap-1"
          >
            {pageName}
            {isDirty && <span className="text-[var(--ds-amber-500)]">•</span>}
          </button>
        )}
      </div>

      {/* Center: Breakpoint selector + Undo/Redo */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onUndo}
                disabled={!canUndo}
                className="h-8 w-8"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent variant="geist" side="bottom">
              <span>Undo</span>
              <Kbd className="ml-2">⌘ Z</Kbd>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onRedo}
                disabled={!canRedo}
                className="h-8 w-8"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent variant="geist" side="bottom">
              <span>Redo</span>
              <Kbd className="ml-2">⌘ ⇧ Z</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Breakpoint selector */}
        <div className="flex items-center gap-1 bg-[var(--ds-gray-100)] rounded-md p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeBreakpoint === 'desktop' || activeBreakpoint === 'wide' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => onBreakpointChange('desktop')}
                className="h-7 w-7"
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent variant="geist" side="bottom">
              Desktop
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeBreakpoint === 'tablet' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => onBreakpointChange('tablet')}
                className="h-7 w-7"
              >
                <Tablet className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent variant="geist" side="bottom">
              Tablet
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeBreakpoint === 'mobile' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => onBreakpointChange('mobile')}
                className="h-7 w-7"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent variant="geist" side="bottom">
              Mobile
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* AI Assistant toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={aiOpen ? 'secondary' : 'ghost'}
              size="sm"
              onClick={onToggleAI}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent variant="geist" side="bottom">
            AI Assistant
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6" />

        {/* Preview */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={onPreview} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent variant="geist" side="bottom">
            Preview page
          </TooltipContent>
        </Tooltip>

        {/* Save */}
        <Button
          size="sm"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className="gap-2 bg-[var(--ds-gray-1000)] hover:bg-[var(--ds-gray-900)]"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? 'Saving…' : 'Save'}</span>
        </Button>
      </div>
    </header>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function EditorV2Page() {
  // Store
  const {
    page,
    setPage,
    updatePage,
    selectedElementIds,
    hoveredElementId,
    activeBreakpoint,
    panels,
    history,
    isDirty,
    isSaving,
    selectElement,
    clearSelection,
    setHoveredElement,
    updateElement,
    deleteElement,
    duplicateElement,
    setActiveBreakpoint,
    togglePanel,
    undo,
    redo,
    setSaving,
    setDirty,
    setLastSavedAt,
  } = useEditorStoreV2();

  // Local state
  const [aiOpen, setAiOpen] = useState(false);

  // Initialize with a default page
  useEffect(() => {
    if (!page) {
      const defaultPage = createPage(
        'demo-tenant',
        'Untitled Page',
        'custom'
      );
      setPage(defaultPage);
    }
  }, [page, setPage]);

  // Get selected element
  const selectedElement = React.useMemo(() => {
    if (!page || selectedElementIds.length !== 1) return null;
    return page.elements[selectedElementIds[0]] || null;
  }, [page, selectedElementIds]);

  // Handlers
  const handlePageNameChange = useCallback(
    (name: string) => {
      updatePage({ name, slug: name.toLowerCase().replace(/\s+/g, '-') });
    },
    [updatePage]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setLastSavedAt(new Date());
    setDirty(false);
  }, [setSaving, setLastSavedAt, setDirty]);

  const handlePreview = useCallback(() => {
    // Open preview in new tab
    window.open('/store/demo', '_blank');
  }, []);

  const handleToggleVisibility = useCallback(
    (elementId: string) => {
      if (!page) return;
      const element = page.elements[elementId];
      if (element) {
        updateElement(elementId, { hidden: !element.hidden });
      }
    },
    [page, updateElement]
  );

  const handleToggleLock = useCallback(
    (elementId: string) => {
      if (!page) return;
      const element = page.elements[elementId];
      if (element) {
        updateElement(elementId, { locked: !element.locked });
      }
    },
    [page, updateElement]
  );

  const handleUpdateElement = useCallback(
    (updates: Partial<VisualElement>) => {
      if (selectedElementIds.length === 1) {
        updateElement(selectedElementIds[0], updates);
      }
    },
    [selectedElementIds, updateElement]
  );

  const handleGeneratePage = useCallback(
    async (prompt: string) => {
      if (!page) return;
      
      try {
        const response = await fetch('/api/editor-v2/ai/generate-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            pageType: 'custom',
            storeContext: {
              name: 'My Store',
              industry: 'retail',
              brandColors: ['#000000', '#ffffff'],
              targetAudience: 'general consumers',
              tone: 'professional',
            },
            tenantId: page.tenantId,
          }),
        });

        const data = await response.json();

        if (data.success && data.page) {
          // Update the page with the generated content
          setPage(data.page);
          console.log('Page generated successfully:', data.message);
          if (data.suggestions?.length > 0) {
            console.log('Suggestions:', data.suggestions);
          }
        } else {
          console.error('Failed to generate page:', data.error);
        }
      } catch (error) {
        console.error('Error generating page:', error);
      }
    },
    [page, setPage]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo: Cmd/Ctrl + Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Cmd/Ctrl + Shift + Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }

      // Save: Cmd/Ctrl + S
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Delete: Backspace or Delete
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedElementIds.length === 1 && page) {
          const element = page.elements[selectedElementIds[0]];
          if (element && element.id !== page.rootElementId) {
            e.preventDefault();
            deleteElement(selectedElementIds[0]);
          }
        }
      }

      // Escape: Clear selection
      if (e.key === 'Escape') {
        clearSelection();
      }

      // Toggle AI: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setAiOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleSave, selectedElementIds, page, deleteElement, clearSelection]);

  if (!page) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--ds-gray-100)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--ds-gray-400)]" />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="h-screen flex flex-col bg-[var(--ds-gray-100)]">
        {/* Header */}
        <EditorHeader
          pageName={page.name}
          onPageNameChange={handlePageNameChange}
          isDirty={isDirty}
          isSaving={isSaving}
          onSave={handleSave}
          onPreview={handlePreview}
          onUndo={undo}
          onRedo={redo}
          canUndo={history.past.length > 0}
          canRedo={history.future.length > 0}
          activeBreakpoint={activeBreakpoint}
          onBreakpointChange={setActiveBreakpoint}
          onToggleAI={() => setAiOpen((prev) => !prev)}
          aiOpen={aiOpen}
        />

        {/* Main content - Simple flex layout */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Left Panel: Layers */}
          <div className="w-64 flex-shrink-0 h-full">
            <LayersPanel
              page={page}
              selectedIds={selectedElementIds}
              hoveredId={hoveredElementId}
              onSelect={selectElement}
              onHover={setHoveredElement}
              onToggleVisibility={handleToggleVisibility}
              onToggleLock={handleToggleLock}
              onDelete={deleteElement}
              onDuplicate={duplicateElement}
            />
          </div>

          {/* Center: Canvas */}
          <div className="flex-1 min-w-0 h-full relative">
            <Canvas page={page} className="h-full w-full" />
          </div>

          {/* Right Panel: Properties */}
          <div className="w-72 flex-shrink-0 h-full">
            <PropertiesPanel
              element={selectedElement}
              onUpdate={handleUpdateElement}
            />
          </div>
        </div>

        {/* AI Chat Panel (floating) */}
        <AIChatPanelV2
          open={aiOpen}
          onOpenChange={setAiOpen}
          onGeneratePage={handleGeneratePage}
        />
      </div>
    </TooltipProvider>
  );
}
