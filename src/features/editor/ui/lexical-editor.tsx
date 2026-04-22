'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { LinkNode, $isLinkNode, $createLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import {
  FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND,
  $getSelection, $isRangeSelection, $getRoot, $createParagraphNode, $createTextNode,
  type EditorState, type LexicalEditor, type ElementFormatType,
} from 'lexical';
import { MIcon } from '../ui/m-icon';
import { cn } from '@/lib/utils';

// ─── Format state ───────────────────────────────────────

type FmtState = {
  isBold: boolean; isItalic: boolean; isUnderline: boolean; isStrikethrough: boolean;
  align: ElementFormatType; isLink: boolean; linkUrl: string;
};

const DEFAULT_FMT: FmtState = { isBold: false, isItalic: false, isUnderline: false, isStrikethrough: false, align: '', isLink: false, linkUrl: '' };

// ─── Toolbar ────────────────────────────────────────────

function Toolbar({ anchorRef }: { anchorRef: React.RefObject<HTMLDivElement | null> }) {
  const [editor] = useLexicalComposerContext();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [fmt, setFmt] = useState<FmtState>(DEFAULT_FMT);
  const [showLink, setShowLink] = useState(false);
  const [linkInput, setLinkInput] = useState('');

  // Track position
  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    let raf: number;
    const update = () => { const r = el.getBoundingClientRect(); setPos({ top: r.top - 34, left: r.left }); raf = requestAnimationFrame(update); };
    update();
    return () => cancelAnimationFrame(raf);
  }, [anchorRef]);

  // Track active formats
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const sel = $getSelection();
        if (!$isRangeSelection(sel)) return;
        const node = sel.anchor.getNode();
        const parent = node.getParent();
        setFmt({
          isBold: sel.hasFormat('bold'), isItalic: sel.hasFormat('italic'),
          isUnderline: sel.hasFormat('underline'), isStrikethrough: sel.hasFormat('strikethrough'),
          align: (node.getParent()?.getFormatType?.() || '') as ElementFormatType,
          isLink: $isLinkNode(parent) || $isLinkNode(node),
          linkUrl: $isLinkNode(parent) ? parent.getURL() : $isLinkNode(node) ? node.getURL() : '',
        });
      });
    });
  }, [editor]);

  const textFmt = (type: 'bold' | 'italic' | 'underline' | 'strikethrough') => editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
  const alignFmt = (type: ElementFormatType) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, type);

  const insertLink = () => {
    if (linkInput) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkInput.startsWith('http') ? linkInput : `https://${linkInput}`);
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
    setShowLink(false);
    setLinkInput('');
  };

  if (!pos) return null;

  const btn = (active: boolean, onDown: () => void, icon: string) => (
    <button onMouseDown={(e) => { e.preventDefault(); onDown(); }}
      className={cn("flex size-6 items-center justify-center rounded-md transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground/70 hover:text-foreground hover:bg-muted")}>
      <MIcon name={icon} size={12} />
    </button>
  );

  const sep = <div className="w-px h-4 bg-sidebar-border mx-0.5" />;

  return createPortal(
    <div className="flex items-center gap-0 p-0.5 bg-background border border-sidebar-border rounded-lg shadow-md fixed z-[9999]" style={{ top: pos.top, left: pos.left }} onClick={(e) => e.stopPropagation()}>
      {/* Text format */}
      {btn(fmt.isBold, () => textFmt('bold'), 'format_bold')}
      {btn(fmt.isItalic, () => textFmt('italic'), 'format_italic')}
      {btn(fmt.isUnderline, () => textFmt('underline'), 'format_underlined')}
      {btn(fmt.isStrikethrough, () => textFmt('strikethrough'), 'format_strikethrough')}

      {sep}

      {/* Alignment */}
      {btn(fmt.align === 'left' || fmt.align === '', () => alignFmt('left'), 'format_align_left')}
      {btn(fmt.align === 'center', () => alignFmt('center'), 'format_align_center')}
      {btn(fmt.align === 'right', () => alignFmt('right'), 'format_align_right')}

      {sep}

      {/* Link */}
      <div className="relative">
        {btn(fmt.isLink, () => { if (fmt.isLink) { editor.dispatchCommand(TOGGLE_LINK_COMMAND, null); } else { setLinkInput(fmt.linkUrl); setShowLink(true); } }, 'link')}
        {showLink && (
          <div className="absolute top-7 left-0 z-50 flex items-center gap-1 p-1 bg-background border border-sidebar-border rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
            <input autoFocus value={linkInput} onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') insertLink(); if (e.key === 'Escape') setShowLink(false); }}
              placeholder="https://..." className="h-6 w-40 rounded-md border border-sidebar-border bg-sidebar px-2 text-[10px] outline-none" />
            <button onMouseDown={(e) => { e.preventDefault(); insertLink(); }}
              className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MIcon name="check" size={12} />
            </button>
          </div>
        )}
      </div>
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
          onSave($generateHtmlFromNodes(editor), $getRoot().getTextContent());
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

  return (
    <LexicalComposer initialConfig={{
      namespace: 'IndigoEditor',
      theme: {
        text: { bold: 'font-bold', italic: 'italic', underline: 'underline', strikethrough: 'line-through' },
        link: 'text-primary underline cursor-pointer',
      },
      nodes: [LinkNode],
      onError: (e: Error) => console.error(e),
    }}>
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
