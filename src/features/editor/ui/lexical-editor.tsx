'use client';

import { useEffect, useCallback } from 'react';
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

function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const fmt = (type: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
  };

  return (
    <div className="flex items-center gap-0.5 px-1.5 py-1 bg-foreground rounded-lg shadow-lg absolute -top-10 left-0 z-50" onClick={(e) => e.stopPropagation()}>
      {([['bold', 'format_bold', 'B'], ['italic', 'format_italic', 'I'], ['underline', 'format_underlined', 'U'], ['strikethrough', 'format_strikethrough', 'S']] as const).map(([cmd, icon]) => (
        <button key={cmd} onMouseDown={(e) => { e.preventDefault(); fmt(cmd); }}
          className="flex size-7 items-center justify-center rounded-md text-background/70 hover:text-background hover:bg-white/15 transition-colors">
          <MIcon name={icon} size={16} />
        </button>
      ))}
    </div>
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
      <div className="relative">
        <Toolbar />
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
