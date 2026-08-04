'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useDocumentStore } from '../core/document-store';
import { useEditorStore } from '../core/editor-store';
import { useEditor } from '../core/provider';
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import { cn } from '@/shared/utils';
import type { El } from '../core/types';
import { resolveStyles } from '../core/types';
import { findParentId } from '../core/tree-helpers';
import { isContainer } from '../core/registry';
import { splitContentStyles } from './interactions/use-style-split';
import { BoxHandlesOverlay } from './interactions/box-handles-overlay';
import { ElementContextMenu } from './interactions/context-menu';
import { ResizeHandles } from './handles/resize-handles';
import { FontSizeHandle } from './handles/font-size-handle';
import { DimensionsBadge } from './handles/dimensions-badge';

import { MotionWrapper } from './motion-wrapper';

const TEXT_TYPES = new Set(['text', 'heading', 'subheading', 'quote', 'code', 'badge', 'list']);

type Props = { element: El; children: ReactNode; className?: string; style?: CSSProperties; containerEl?: boolean };

export default function ElementWrapper({ element, children, className, style, containerEl }: Props) {
  const { dispatch } = useEditor();
  const selected = useEditorStore(s => s.selected);
  const preview = useEditorStore(s => s.preview);
  const hovered = useEditorStore(s => s.hovered);
  const dropTarget = useEditorStore(s => s.dropTarget);
  const device = useEditorStore(s => s.device);
  const editingState = useEditorStore(s => s.editingState);
  const elements = useDocumentStore(s => s.elements);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isBody = element.type === '__body';
  const isSel = selected?.id === element.id;
  const isHov = hovered === element.id && !isSel;
  const isDrop = dropTarget === element.id && containerEl;
  const parentId = findParentId(elements, element.id);
  
  let resolved = style ?? resolveStyles(element, device);
  if (isSel && editingState === 'hover' && element.hoverStyles) {
    resolved = { ...resolved, ...element.hoverStyles };
  }

  const { wrapperStyles, contentStyles, hasContentStyles } = splitContentStyles(resolved);

  if (element.hidden && preview) return null;
  if (element.hidden && !preview) return <div className={`relative opacity-40 pointer-events-none el-${element.id}`} style={resolved}>{children}</div>;
  if (preview) {
    return (
      <MotionWrapper animations={element.animations} style={resolved} className={cn(`el-${element.id}`, className)}>
        {children}
      </MotionWrapper>
    );
  }

  return (
    <ContextMenu>
    <ContextMenuTrigger disabled={isBody} asChild>
    <MotionWrapper
      ref={wrapperRef}
      animations={element.animations}
      disableAnimations={!preview}
      data-wrapper
      data-el-id={element.id}
      draggable={!isBody && !element.locked}
      onDragStart={(e: any) => {
        if (isBody || element.locked) { e.preventDefault(); return; }
        e.dataTransfer.setData('moveElementId', element.id);
        e.dataTransfer.effectAllowed = 'move';
        e.stopPropagation();
      }}
      className={cn(
        `el-${element.id}`,
        'relative group/el min-w-0',
        isSel && !isBody && 'outline outline-2 outline-blue-500 -outline-offset-1',
        isHov && !isBody && 'outline outline-1 outline-blue-400/40 -outline-offset-1 cursor-pointer',
        isDrop && 'outline outline-2 outline-emerald-500/60 -outline-offset-1 bg-emerald-500/[0.04] cursor-copy',
        isBody && 'min-h-full',
        !isBody && element.locked && 'cursor-not-allowed opacity-90',
        className,
      )}
      style={wrapperStyles as CSSProperties}
      onClick={(e: any) => { e.stopPropagation(); dispatch({ type: 'CHANGE_CLICKED_ELEMENT', payload: { element } }); }}
      onDragOver={(e: any) => { e.preventDefault(); }}
      onMouseEnter={() => dispatch({ type: 'SET_HOVERED', payload: { id: element.id } })}
      onMouseLeave={() => { if (hovered === element.id) dispatch({ type: 'SET_HOVERED', payload: { id: null } }); }}
    >
      {!isBody && <BoxHandlesOverlay element={element} isSel={isSel} isHov={isHov} dispatch={dispatch} />}

      {isSel && !isBody && !element.locked && (<>
        {!isContainer(element.type) && <ResizeHandles element={element} wrapperRef={wrapperRef} dispatch={dispatch} />}
        {TEXT_TYPES.has(element.type) && <FontSizeHandle element={element} dispatch={dispatch} />}
        <DimensionsBadge wrapperRef={wrapperRef} isSelected={isSel} />
      </>)}

      {hasContentStyles ? <div style={contentStyles as CSSProperties}>{children}</div> : children}
    </MotionWrapper>
    </ContextMenuTrigger>
    {!isBody && <ElementContextMenu element={element} parentId={parentId} dispatch={dispatch} />}
    </ContextMenu>
  );
}
