'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection, $getRoot, $createParagraphNode, $createTextNode, type EditorState, type LexicalEditor } from 'lexical';
import { MIcon } from '../ui/m-icon';
import { cn } from '@/lib/utils';

// ─── Toolbar ────────────────────────────────────────────

function Toolbar({ anchorRef }: { anchorRef: React.RefObject<HTMLDivElement | null> }) {
  const [editor] = useLexicalComposerContext();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    let raf: number;
    const update = () => {
      const r = el.getBoundingClientRect();
      setPos({ top: r.top - 36, left: r.left });
      raf = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(raf);
  }, [anchorRef]);

  const fmt = (type: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
  };

  if (!pos) return null;

  return createPortal(
    <div className="flex items-center gap-0 p-0.5 bg-background border border-sidebar-border rounded-lg shadow-md fixed z-[9999]" style={{ top: pos.top, left: pos.left }} onClick={(e) => e.stopPropagation()}>
      {([['bold', 'format_bold'], ['italic', 'format_italic'], ['underline', 'format_underlined'], ['strikethrough', 'format_strikethrough']] as const).map(([cmd, icon]) => (
        <button key={cmd} onMouseDown={(e) => { e.preventDefault(); fmt(cmd); }}
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors">
          <MIcon name={icon} size={13} />
        </button>
      ))}
    </div>,
    document.body
  );
}

// ─── Init plugin: load HTML content into editor ─────────

function InitPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!html) return;
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      // If it looks like HTML, parse it; otherwise treat as plain text
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

// ─── Main component ─────────────────────────────────────

interface Props {
  initialHtml: string;
  onSave: (html: string, plainText: string) => void;
  onBlur: () => void;
}

export default function LexicalTextEditor({ initialHtml, onSave, onBlur }: Props) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const onChange = useCallback((state: EditorState, editor: LexicalEditor) => {
    state.read(() => {
      const html = $generateHtmlFromNodes(editor);
      const text = $getRoot().getTextContent();
      onSave(html, text);
    });
  }, [onSave]);

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
        <OnChangePlugin onChange={onChange} />
        <InitPlugin html={initialHtml} />
        <BlurPlugin onBlur={onBlur} />
      </div>
    </LexicalComposer>
  );
}

function BlurPlugin({ onBlur }: { onBlur: () => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerRootListener((root) => {
      if (root) {
        root.addEventListener('blur', onBlur);
        return () => root.removeEventListener('blur', onBlur);
      }
    });
  }, [editor, onBlur]);
  return null;
}
