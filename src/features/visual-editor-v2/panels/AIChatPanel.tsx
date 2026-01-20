'use client';

/**
 * Visual Editor V2 - AI Chat Panel
 *
 * Conversational AI interface for page generation, similar to v0.dev and Puck editor.
 * Supports natural language prompts for generating sections, modifying elements,
 * and creating complete pages.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
  Layout,
  Grid3X3,
  MessageSquare,
  Star,
  Footprints,
  Wand2,
  AlertCircle,
  Layers,
  Command,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/shared/utils';
import { useEditorStoreV2 } from '../store/editor-store';
import type { VisualElement } from '../types/element';
import type { Page } from '../types/page';

// ============================================================================
// TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'pending' | 'success' | 'error';
  generatedContent?: {
    type: 'page' | 'section' | 'element';
    preview?: string;
    elements?: Record<string, VisualElement>;
    page?: Page;
  };
  error?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
  category: 'section' | 'layout' | 'content';
}

export interface StoreContext {
  name: string;
  industry: string;
  brandColors: string[];
  targetAudience: string;
  tone: 'professional' | 'casual' | 'luxury' | 'playful' | 'friendly';
  description?: string;
  products?: Array<{
    name: string;
    price: number;
    image?: string;
  }>;
  categories?: string[];
}

export interface AIChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  storeContext?: StoreContext;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'hero',
    label: 'Generate Hero',
    icon: Layout,
    prompt: 'Generate a hero section with a compelling headline, subheadline, and call-to-action button',
    category: 'section',
  },
  {
    id: 'product-grid',
    label: 'Add Product Grid',
    icon: Grid3X3,
    prompt: 'Add a product grid section with 4 columns showing featured products',
    category: 'section',
  },
  {
    id: 'testimonials',
    label: 'Add Testimonials',
    icon: MessageSquare,
    prompt: 'Add a testimonials section with customer reviews and ratings',
    category: 'section',
  },
  {
    id: 'cta',
    label: 'Add CTA Section',
    icon: Star,
    prompt: 'Add a call-to-action section with a strong headline and action button',
    category: 'section',
  },
  {
    id: 'footer',
    label: 'Add Footer',
    icon: Footprints,
    prompt: 'Add a footer section with navigation links, social media icons, and copyright',
    category: 'section',
  },
];

const DEFAULT_STORE_CONTEXT: StoreContext = {
  name: 'My Store',
  industry: 'retail',
  brandColors: ['#000000', '#ffffff'],
  targetAudience: 'general consumers',
  tone: 'professional',
};

// ============================================================================
// LOADING DOTS ANIMATION
// ============================================================================

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-(--ds-purple-600)"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </span>
  );
}

// ============================================================================
// MESSAGE COMPONENT
// ============================================================================

interface MessageProps {
  message: ChatMessage;
  onApply?: () => void;
  onRegenerate?: () => void;
  isApplying?: boolean;
}

function Message({ message, onApply, onRegenerate, isApplying }: MessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const hasGeneratedContent = message.generatedContent && message.status === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex flex-col gap-2',
        isUser ? 'items-end' : 'items-start'
      )}
    >
      {/* Message bubble */}
      <div
        className={cn(
          'max-w-[90%] rounded-lg px-3 py-2 text-sm',
          isUser
            ? 'bg-(--ds-gray-1000) text-white'
            : isSystem
            ? 'bg-(--ds-amber-100) text-(--ds-amber-900) border border-(--ds-amber-200)'
            : 'bg-(--ds-gray-100) text-(--ds-gray-900)'
        )}
      >
        {message.status === 'pending' ? (
          <div className="flex items-center gap-2">
            <span className="text-(--ds-gray-600)">Generating</span>
            <LoadingDots />
          </div>
        ) : message.status === 'error' ? (
          <div className="flex items-center gap-2 text-(--ds-red-700)">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{message.error || 'Something went wrong'}</span>
          </div>
        ) : (
          <span className="whitespace-pre-wrap">{message.content}</span>
        )}
      </div>

      {/* Generated content preview and actions */}
      {hasGeneratedContent && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="w-full max-w-[90%] rounded-lg border border-(--ds-gray-200) bg-(--ds-background-100) overflow-hidden"
        >
          {/* Preview placeholder */}
          {message.generatedContent?.preview && (
            <div className="p-3 border-b border-(--ds-gray-200) bg-(--ds-gray-50)">
              <div className="flex items-center gap-2 text-xs text-(--ds-gray-600)">
                <Layers className="h-3.5 w-3.5" />
                <span>
                  Generated {message.generatedContent.type}
                  {message.generatedContent.elements && (
                    <span className="ml-1">
                      ({Object.keys(message.generatedContent.elements).length} elements)
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 p-2">
            <Button
              size="sm"
              onClick={onApply}
              disabled={isApplying}
              className="h-8 gap-1.5 bg-(--ds-green-600) hover:bg-(--ds-green-700) text-white"
            >
              {isApplying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onRegenerate}
              disabled={isApplying}
              className="h-8 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </Button>
          </div>
        </motion.div>
      )}

      {/* Error retry */}
      {message.status === 'error' && onRegenerate && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRegenerate}
          className="h-7 gap-1.5 text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </Button>
      )}

      {/* Timestamp */}
      <span className="text-[10px] text-(--ds-gray-400)">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AIChatPanel({
  isOpen,
  onToggle,
  storeContext = DEFAULT_STORE_CONTEXT,
  className,
}: AIChatPanelProps) {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Editor store
  const page = useEditorStoreV2((s) => s.page);
  const selectedElementIds = useEditorStoreV2((s) => s.selectedElementIds);
  const addElement = useEditorStoreV2((s) => s.addElement);

  // Get selected element for context
  const selectedElement = useMemo(() => {
    if (!page || selectedElementIds.length !== 1) return null;
    return page.elements[selectedElementIds[0]] || null;
  }, [page, selectedElementIds]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or / to focus input (when panel is open)
      if (isOpen && (e.key === '/' || (e.metaKey && e.key === 'k'))) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Add message helper
  const addMessage = useCallback(
    (
      role: ChatMessage['role'],
      content: string,
      options?: Partial<ChatMessage>
    ): ChatMessage => {
      const message: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role,
        content,
        timestamp: Date.now(),
        ...options,
      };
      setMessages((prev) => [...prev, message]);
      return message;
    },
    []
  );

  // Update message helper
  const updateMessage = useCallback(
    (messageId: string, updates: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        )
      );
    },
    []
  );

  // Generate content via API
  const generateContent = useCallback(
    async (prompt: string, messageId: string) => {
      try {
        const response = await fetch('/api/editor-v2/ai/generate-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            storeContext,
            tenantId: page?.tenantId || 'default',
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to generate content');
        }

        updateMessage(messageId, {
          status: 'success',
          content: data.message || 'Content generated successfully!',
          generatedContent: {
            type: data.page ? 'page' : 'section',
            preview: 'Generated content ready to apply',
            page: data.page,
            elements: data.page?.elements,
          },
        });

        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        updateMessage(messageId, {
          status: 'error',
          error: errorMessage,
        });
        throw error;
      }
    },
    [storeContext, page?.tenantId, updateMessage]
  );

  // Handle send message
  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Add user message
    addMessage('user', trimmedInput);
    setInput('');
    setLastPrompt(trimmedInput);
    setIsLoading(true);

    // Add pending assistant message
    const assistantMessage = addMessage('assistant', '', { status: 'pending' });

    try {
      await generateContent(trimmedInput, assistantMessage.id);
    } catch {
      // Error already handled in generateContent
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, addMessage, generateContent]);

  // Handle regenerate
  const handleRegenerate = useCallback(
    async (messageId: string) => {
      if (!lastPrompt || isLoading) return;

      setIsLoading(true);
      updateMessage(messageId, { status: 'pending', error: undefined });

      try {
        await generateContent(lastPrompt, messageId);
      } catch {
        // Error already handled
      } finally {
        setIsLoading(false);
      }
    },
    [lastPrompt, isLoading, updateMessage, generateContent]
  );

  // Handle apply generated content
  const handleApply = useCallback(
    async (message: ChatMessage) => {
      if (!message.generatedContent?.elements || !page) return;

      setIsApplying(true);

      try {
        // Add generated elements to the page
        const elements = message.generatedContent.elements;
        const rootId = page.rootElementId;

        for (const [, element] of Object.entries(elements)) {
          // Skip the root element if it exists
          if (element.id === rootId) continue;

          // Add element to the page
          if (element.parentId === null) {
            // Top-level element, add to root
            addElement(element, rootId);
          } else {
            addElement(element, element.parentId);
          }
        }

        // Add success message
        addMessage(
          'system',
          `✓ Applied ${Object.keys(elements).length} elements to your page`
        );
      } catch (error) {
        addMessage(
          'system',
          `Failed to apply: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setIsApplying(false);
      }
    },
    [page, addElement, addMessage]
  );

  // Handle quick action
  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      setInput(action.prompt);
      inputRef.current?.focus();
    },
    []
  );

  // Handle key down
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Clear chat
  const handleClearChat = useCallback(() => {
    setMessages([]);
    setLastPrompt(null);
  }, []);

  return (
    <div
      className={cn(
        'flex flex-col bg-(--ds-background-100) border-l border-(--ds-gray-200) transition-all duration-300',
        isOpen ? 'w-[360px]' : 'w-0',
        className
      )}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full w-[360px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--ds-gray-200)">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-7 w-7 rounded-md bg-(--ds-purple-100)">
                  <Sparkles className="h-4 w-4 text-(--ds-purple-700)" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-(--ds-gray-1000)">
                    AI Assistant
                  </h3>
                  <p className="text-[10px] text-(--ds-gray-500)">
                    Generate pages &amp; sections
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClearChat}
                  className="h-7 w-7"
                  title="Clear chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onToggle}
                  className="h-7 w-7"
                >
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Selection context */}
            {selectedElement && (
              <div className="px-4 py-2 border-b border-(--ds-gray-200) bg-(--ds-gray-50)">
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="geist-purple-subtle" size="sm">
                    Selected
                  </Badge>
                  <span className="text-(--ds-gray-700) truncate">
                    {selectedElement.name} ({selectedElement.type})
                  </span>
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1" ref={scrollRef}>
              <div className="p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="space-y-4">
                    {/* Welcome message */}
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-(--ds-purple-100) mb-3">
                        <Wand2 className="h-6 w-6 text-(--ds-purple-700)" />
                      </div>
                      <h4 className="text-sm font-medium text-(--ds-gray-900) mb-1">
                        What would you like to create?
                      </h4>
                      <p className="text-xs text-(--ds-gray-500) max-w-[240px] mx-auto">
                        Describe what you want and I&apos;ll generate it for you.
                        Try the quick actions below or type your own prompt.
                      </p>
                    </div>

                    {/* Quick actions */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-(--ds-gray-600) px-1">
                        Quick actions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_ACTIONS.map((action) => (
                          <button
                            key={action.id}
                            onClick={() => handleQuickAction(action)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-(--ds-gray-200) bg-(--ds-background-100) hover:bg-(--ds-gray-100) hover:border-(--ds-gray-300) transition-colors"
                          >
                            <action.icon className="h-3.5 w-3.5 text-(--ds-purple-600)" />
                            <span className="text-(--ds-gray-700)">
                              {action.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Example prompts */}
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-medium text-(--ds-gray-600) px-1">
                        Example prompts
                      </p>
                      <div className="space-y-1.5">
                        {[
                          'Generate a hero section with a summer sale theme',
                          'Add a product grid with 4 columns',
                          'Make this section responsive for mobile',
                          'Generate a complete landing page for a coffee shop',
                        ].map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setInput(prompt);
                              inputRef.current?.focus();
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-(--ds-gray-600) rounded-md border border-(--ds-gray-200) hover:bg-(--ds-gray-50) hover:text-(--ds-gray-800) transition-colors"
                          >
                            &ldquo;{prompt}&rdquo;
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <Message
                        key={message.id}
                        message={message}
                        onApply={
                          message.generatedContent
                            ? () => handleApply(message)
                            : undefined
                        }
                        onRegenerate={() => handleRegenerate(message.id)}
                        isApplying={isApplying}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-(--ds-gray-200) p-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you want to create…"
                    className="min-h-[44px] max-h-[120px] resize-none text-sm pr-10"
                    disabled={isLoading}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1 text-[10px] text-(--ds-gray-400)">
                    <Command className="h-3 w-3" />
                    <span>K</span>
                  </div>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-11 w-11 p-0 bg-(--ds-purple-600) hover:bg-(--ds-purple-700)"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-(--ds-gray-400) mt-2 text-center">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed state toggle button */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onToggle}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-l-lg bg-(--ds-purple-600) text-white shadow-lg hover:bg-(--ds-purple-700) transition-colors"
          title="Open AI Assistant (⌘K)"
        >
          <Sparkles className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  );
}

export default AIChatPanel;
