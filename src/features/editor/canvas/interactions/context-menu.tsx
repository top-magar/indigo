'use client';

import type { ReactNode } from 'react';
import { MIcon } from '../../ui/m-icon';
import { ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut } from '@/components/ui/context-menu';
import type { El } from '../../core/types';
import type { useEditor } from '../../core/provider';
import { k } from '../../lib/keys';
import { saveComponent } from '../../lib/queries';
import { toast } from 'sonner';

export function ElementContextMenu({ element, parentId, dispatch }: {
  element: El; parentId: string | null; dispatch: ReturnType<typeof useEditor>['dispatch'];
}): ReactNode {
  const handleSaveComponent = async () => {
    const name = element.name || element.type;
    await saveComponent({ name, element: JSON.stringify(element) });
    toast.success(`Saved "${name}" as component`);
  };

  return (
    <ContextMenuContent className="w-44 text-xs p-1">
      {parentId && <ContextMenuItem className="h-7 gap-2" onClick={() => dispatch({ type: 'DUPLICATE_ELEMENT', payload: { elId: element.id, containerId: parentId } })}><MIcon name="content_copy" size={13} />Duplicate<ContextMenuShortcut>{k('⌘D', 'Ctrl+D')}</ContextMenuShortcut></ContextMenuItem>}
      <ContextMenuItem className="h-7 gap-2" onClick={() => navigator.clipboard.writeText(JSON.stringify(element))}><MIcon name="content_paste" size={13} />Copy<ContextMenuShortcut>{k('⌘C', 'Ctrl+C')}</ContextMenuShortcut></ContextMenuItem>
      <ContextMenuSeparator className="my-0.5" />
      <ContextMenuItem className="h-7 gap-2" onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'up' } })}><MIcon name="arrow_upward" size={13} />Move Up<ContextMenuShortcut>{k('⌘↑', 'Ctrl+↑')}</ContextMenuShortcut></ContextMenuItem>
      <ContextMenuItem className="h-7 gap-2" onClick={() => dispatch({ type: 'REORDER_ELEMENT', payload: { elId: element.id, direction: 'down' } })}><MIcon name="arrow_downward" size={13} />Move Down<ContextMenuShortcut>{k('⌘↓', 'Ctrl+↓')}</ContextMenuShortcut></ContextMenuItem>
      <ContextMenuSeparator className="my-0.5" />
      <ContextMenuItem className="h-7 gap-2" onClick={() => dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, locked: !element.locked } } })}><MIcon name={element.locked ? "lock_open" : "lock"} size={13} />{element.locked ? "Unlock" : "Lock"}</ContextMenuItem>
      <ContextMenuItem className="h-7 gap-2" onClick={() => dispatch({ type: 'UPDATE_ELEMENT', payload: { element: { ...element, hidden: !element.hidden } } })}><MIcon name={element.hidden ? "visibility" : "visibility_off"} size={13} />{element.hidden ? "Show" : "Hide"}</ContextMenuItem>
      <ContextMenuItem className="h-7 gap-2" onClick={handleSaveComponent}><MIcon name="bookmark" size={13} />Save as Component</ContextMenuItem>
      <ContextMenuSeparator className="my-0.5" />
      <ContextMenuItem className="h-7 gap-2 text-destructive focus:text-destructive" onClick={() => dispatch({ type: 'DELETE_ELEMENT', payload: { id: element.id } })}><MIcon name="delete" size={13} />Delete<ContextMenuShortcut>⌫</ContextMenuShortcut></ContextMenuItem>
    </ContextMenuContent>
  );
}
