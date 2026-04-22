'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection, $getRoot, $createParagraphNode, $createTextNode, type EditorState, type LexicalEditor } from 'lexical';
import { MIcon } from '../ui/m-icon';
import { cn } from '@/lib/utils';

// ─── Toolbar with active states ─────────────────────────

const FMT_BUTTONS = [
  { cmd: 'bold' as const, icon: 'format_bold', key: 'isBold' as const },
  { cmd: 'italic' as const, icon: 'format_italic', key: 'isItalic' as const },
  { cmd: 'underline' as const, icon: 'format_underlined', key: 'isUnderline' as const },
  { cmd: 'strikethrough' as const, icon: 'format_strikethrough', key: 'isStrikethrough' as const },
];

type FmtState = { isBold: boolean; isItalic: boolean; isUnderline: boolean; isStrikethrough: boolean };

function Toolbar({ anchorRef }: { anchorRef: React.RefObject<HTMLDivElement | null> }) {
  const [editor] = useLexicalComposerContext();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [fmt, setFmt] = useState<FmtState>({ isBold: false, isItalic: false, isUnderline: false, isStrikethrough: false });

  // Track position
  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    let raf: number;
    const update = () => {
      const r = el.getBoundingClientRect();
      setPos({ top: r.top - 34, left: r.left });
      raf = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(raf);
  }, [anchorRef]);

  // Track active formats
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const sel = $getSelection();
        if ($isRangeSelection(sel)) {
          setFmt({ isBold: sel.hasFormat('bold'), isItalic: sel.hasFormat('italic'), isUnderline: sel.hasFormat('underline'), isStrikethrough: sel.hasFormat('strikethrough') });
        }
      });
    });
  }, [editor]);

  if (!pos) return null;

  return createPortal(
    <div className="flex items-center gap-0 p-0.5 bg-background border border-sidebar-border rounded-lg shadow-md fixed z-[9999]" style={{ top: pos.top, left: pos.left }} onClick={(e) => e.stopPropagation()}>
      {FMT_BUTTONS.map(({ cmd, icon, key }) => (
        <button key={cmd} onMouseDown={(e) => { e.preventDefault(); editor.dispatchCommand(FORMAT_TEXT_COMMAND, cmd); }}
          className={cn("flex size-6 items-center justify-center rounded-md transition-colors",
            fmt[key] ? "bg-primary text-primary-foreground" : "text-muted-foreground/70 hover:text-foreground hover:bg-muted")}>
          <MIcon name={icon} size={13} />
        </button>
      ))}
    </div>,
    document.body
  );
}

// ─── Init plugin ────────────────────────────────────────

function InitPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!html) return;
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      if (html.includes('<')) {
        const dom = new DOMParser().parseFromString(html, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        nodes.forEach(n => root.append(n));
      } else {
        const p = $createParagraphNode();
        p.append($createTextNode(html));
        root.append(p);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// ─── Debounced save plugin ──────────────────────────────

function SavePlugin({ onSave }: { onSave: (html: string, text: string) => void }) {
  const [editor] = useLexicalComposerContext();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        editorState.read(() => {
          const html = $generateHtmlFromNodes(editor);
          const text = $getRoot().getTextContent();
          onSave(html, text);
        });
      }, 300);
    });
  }, [editor, onSave]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return null;
}

// ─── Blur plugin ────────────────────────────────────────

function BlurPlugin({ onBlur }: { onBlur: () => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;
    root.addEventListener('blur', onBlur);
    return () => root.removeEventListener('blur', onBlur);
  }, [editor, onBlur]);
  return null;
}

// ─── Main component ─────────────────────────────────────

interface Props {
  initialHtml: string;
  onSave: (html: string, plainText: string) => void;
  onBlur: () => void;
}

export default function LexicalTextEditor({ initialHtml, onSave, onBlur }: Props) {
  const anchorRef = useRef<HTMLDivElement>(null);

  const config = {
    namespace: 'IndigoEditor',
    theme: {
      text: { bold: 'font-bold', italic: 'italic', underline: 'underline', strikethrough: 'line-through' },
      link: 'text-primary underline cursor-pointer',
    },
    nodes: [LinkNode],
    onError: (e: Error) => console.error(e),
  };

  return (
    <LexicalComposer initialConfig={config}>
      <div className="relative" ref={anchorRef}>
        <Toolbar anchorRef={anchorRef} />
        <RichTextPlugin
          contentEditable={<ContentEditable className="outline-none min-h-[1em]" style={{ whiteSpace: 'pre-wrap' }} />}
          ErrorBoundary={({ children }) => <>{children}</>}
        />
        <HistoryPlugin />
        <LinkPlugin />
        <SavePlugin onSave={onSave} />
        <InitPlugin html={initialHtml} />
        <BlurPlugin onBlur={onBlur} />
      </div>
    </LexicalComposer>
  );
}
