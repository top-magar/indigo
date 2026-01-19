'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Trash2,
  X,
  Plus,
  Wand2,
  Languages,
  Lightbulb,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/shared/utils';
import { generateHeadline, improveContent } from '../api-client';
import { useEditorStore, selectBlocks, selectSelectedBlockId } from '@/features/editor/store';
import type { BlockType } from '@/types/blocks';

// ============================================================================
// TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  actions?: ChatAction[];
}

export interface ChatAction {
  id: string;
  type: 'add_block' | 'update_settings' | 'generate_content' | 'improve_content' | 'translate';
  label: string;
  payload: Record<string, unknown>;
}

export interface AIChatPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeName?: string;
}

// ============================================================================
// SUGGESTED PROMPTS
// ============================================================================

const SUGGESTED_PROMPTS = [
  { icon: Plus, text: 'Add a hero section with a summer sale theme' },
  { icon: Lightbulb, text: 'Generate 5 FAQ items about shipping' },
  { icon: Wand2, text: 'Improve the SEO of this page' },
  { icon: Sparkles, text: 'Make the design more modern' },
  { icon: MessageSquare, text: 'Add testimonials section' },
  { icon: Languages, text: 'Translate all text to Spanish' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function AIChatPanel({
  open,
  onOpenChange,
  storeName = 'My Store',
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Editor state
  const blocks = useEditorStore(selectBlocks);
  const selectedBlockId = useEditorStore(selectSelectedBlockId);
  const addBlockByType = useEditorStore((s) => s.addBlockByType);
  const updateBlockSettings = useEditorStore((s) => s.updateBlockSettings);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string, actions?: ChatAction[]) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role,
      content,
      timestamp: Date.now(),
      actions,
    };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Add user message
    addMessage('user', trimmedInput);
    setInput('');
    setIsLoading(true);

    try {
      // Generate AI response based on user input
      const result = await generateHeadline({
        storeName,
        tone: 'professional',
        existingHeadline: trimmedInput,
      });

      if (result.success && result.content) {
        // Parse response for actions
        const actions = parseActionsFromResponse(trimmedInput);
        addMessage('assistant', `Here's what I can help with: ${result.content}`, actions);
      } else {
        addMessage('assistant', 'I apologize, but I encountered an issue processing your request. Please try again.');
      }
    } catch {
      addMessage('assistant', 'Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, addMessage, storeName]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleSuggestedPrompt = useCallback((text: string) => {
    setInput(text);
    inputRef.current?.focus();
  }, []);

  const handleAction = useCallback(async (action: ChatAction) => {
    setIsLoading(true);
    try {
      switch (action.type) {
        case 'add_block':
          addBlockByType(action.payload.blockType as BlockType, action.payload.variant as string || 'default');
          addMessage('assistant', `Added ${action.payload.blockType} block to your page.`);
          break;

        case 'update_settings':
          if (selectedBlockId) {
            updateBlockSettings(selectedBlockId, action.payload.settings as Record<string, unknown>);
            addMessage('assistant', 'Updated the block settings.');
          }
          break;

        case 'generate_content':
          const genResult = await generateHeadline({
            storeName: action.payload.storeName as string || 'Store',
            tone: 'professional',
          });
          if (genResult.success) {
            addMessage('assistant', `Generated: ${genResult.content}`);
          }
          break;

        case 'improve_content':
          if (selectedBlockId) {
            const block = blocks.find((b) => b.id === selectedBlockId);
            if (block) {
              const improveResult = await improveContent(
                JSON.stringify(block.settings),
                'clarity'
              );
              if (improveResult.success && improveResult.improvedContent) {
                try {
                  const improved = JSON.parse(improveResult.improvedContent);
                  updateBlockSettings(selectedBlockId, improved);
                  addMessage('assistant', 'Content improved!');
                } catch {
                  addMessage('assistant', improveResult.improvedContent);
                }
              }
            }
          }
          break;

        case 'translate':
          addMessage('assistant', 'Translation feature coming soon!');
          break;
      }
    } catch {
      addMessage('assistant', 'Failed to execute action. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [addBlockByType, updateBlockSettings, selectedBlockId, blocks, addMessage]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-(--ds-purple-600)" />
              AI Assistant
            </SheetTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="h-8 w-8 p-0"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-(--ds-gray-500) text-center py-4">
                  Ask me anything about your page or request changes.
                </p>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-(--ds-gray-600)">Suggested prompts:</p>
                  {SUGGESTED_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPrompt(prompt.text)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md border border-(--ds-gray-200) hover:bg-(--ds-gray-100) transition-colors"
                    >
                      <prompt.icon className="h-4 w-4 text-(--ds-purple-600) shrink-0" />
                      <span className="text-(--ds-gray-700)">{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex flex-col gap-2',
                    message.role === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                      message.role === 'user'
                        ? 'bg-(--ds-purple-600) text-white'
                        : 'bg-(--ds-gray-100) text-(--ds-gray-900)'
                    )}
                  >
                    {message.content}
                  </div>
                  {message.actions && message.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 max-w-[85%]">
                      {message.actions.map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(action)}
                          className="h-7 text-xs"
                          disabled={isLoading}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] text-(--ds-gray-400)">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-(--ds-gray-100) rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-(--ds-purple-600)" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI to help with your page..."
              className="min-h-[44px] max-h-[120px] resize-none text-sm"
              disabled={isLoading}
            />
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
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function parseActionsFromResponse(content: unknown): ChatAction[] {
  // If content has explicit actions, use them
  if (typeof content === 'object' && content !== null && 'actions' in content) {
    return (content as { actions: ChatAction[] }).actions || [];
  }
  
  // Otherwise, try to infer actions from the response
  const actions: ChatAction[] = [];
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  
  // Check for block addition suggestions
  if (contentStr.toLowerCase().includes('add') && contentStr.toLowerCase().includes('block')) {
    const blockTypes = ['hero', 'testimonials', 'faq', 'newsletter', 'product-grid'];
    for (const type of blockTypes) {
      if (contentStr.toLowerCase().includes(type)) {
        actions.push({
          id: `action-${Date.now()}-${type}`,
          type: 'add_block',
          label: `Add ${type}`,
          payload: { blockType: type, variant: 'default' },
        });
        break;
      }
    }
  }
  
  // Check for improvement suggestions
  if (contentStr.toLowerCase().includes('improve') || contentStr.toLowerCase().includes('enhance')) {
    actions.push({
      id: `action-${Date.now()}-improve`,
      type: 'improve_content',
      label: 'Improve content',
      payload: {},
    });
  }
  
  return actions;
}
