"use client";

/**
 * Visual Editor V2 - Layers Panel
 *
 * A Figma-like layers panel for managing page elements.
 * Features:
 * - Hierarchical tree view of elements
 * - Drag-and-drop reordering
 * - Multi-select with Shift+Click and Cmd/Ctrl+Click
 * - Right-click context menu
 * - Search/filter elements
 * - Visibility and lock toggles
 * - Inline renaming
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Type,
  Image,
  Square,
  Layout,
  Component,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Search,
  Video,
  Link,
  FormInput,
  MousePointer,
  Code,
  Minus,
  FileCode,
  Layers,
  Copy,
  Trash2,
  Group,
  Ungroup,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useEditorStoreV2 } from "../store/editor-store";
import type { VisualElement, ElementType } from "../types/element";

// ============================================================================
// TYPES
// ============================================================================

interface LayerItemData {
  element: VisualElement;
  depth: number;
  hasChildren: boolean;
}

// ============================================================================
// ELEMENT TYPE ICONS
// ============================================================================

const ELEMENT_ICONS: Record<ElementType, React.ComponentType<{ className?: string }>> = {
  frame: Square,
  text: Type,
  image: Image,
  video: Video,
  component: Component,
  slot: Layers,
  form: FormInput,
  input: FormInput,
  button: MousePointer,
  link: Link,
  icon: Component,
  divider: Minus,
  embed: FileCode,
  code: Code,
  html: FileCode,
};

function getElementIcon(type: ElementType) {
  return ELEMENT_ICONS[type] || Layout;
}

// ============================================================================
// LAYER ITEM COMPONENT
// ============================================================================

interface LayerItemProps {
  item: LayerItemData;
  isSelected: boolean;
  isHovered: boolean;
  isExpanded: boolean;
  isEditing: boolean;
  editingName: string;
  onSelect: (e: React.MouseEvent) => void;
  onToggleExpand: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onStartRename: () => void;
  onFinishRename: (newName: string) => void;
  onCancelRename: () => void;
  onEditingNameChange: (name: string) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isDragOverlay?: boolean;
}

function LayerItem({
  item,
  isSelected,
  isHovered,
  isExpanded,
  isEditing,
  editingName,
  onSelect,
  onToggleExpand,
  onToggleVisibility,
  onToggleLock,
  onStartRename,
  onFinishRename,
  onCancelRename,
  onEditingNameChange,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
  isDragOverlay = false,
}: LayerItemProps) {
  const { element, depth, hasChildren } = item;
  const inputRef = useRef<HTMLInputElement>(null);
  const Icon = getElementIcon(element.type);

  // Sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id, disabled: isDragOverlay });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle keyboard events for renaming
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onFinishRename(editingName);
    } else if (e.key === "Escape") {
      onCancelRename();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group flex items-center h-8 px-2 rounded-md cursor-pointer select-none",
        "transition-colors duration-150",
        isSelected && "bg-[var(--ds-gray-200)]",
        isHovered && !isSelected && "bg-[var(--ds-gray-100)]",
        !isSelected && !isHovered && "hover:bg-[var(--ds-gray-100)]",
        element.hidden && "opacity-50",
        isDragOverlay && "shadow-lg bg-[var(--ds-background)] border border-[var(--ds-gray-300)]"
      )}
      onClick={onSelect}
      onDoubleClick={onStartRename}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={hasChildren ? isExpanded : undefined}
      tabIndex={0}
    >
      {/* Indentation */}
      <div style={{ width: depth * 16 }} className="shrink-0" />

      {/* Expand/Collapse button */}
      <button
        type="button"
        className={cn(
          "shrink-0 w-4 h-4 flex items-center justify-center rounded",
          "hover:bg-[var(--ds-gray-200)] transition-colors",
          !hasChildren && "invisible"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand();
        }}
        aria-label={isExpanded ? "Collapse" : "Expand"}
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 text-[var(--ds-gray-600)]" />
        ) : (
          <ChevronRight className="h-3 w-3 text-[var(--ds-gray-600)]" />
        )}
      </button>

      {/* Element icon */}
      <Icon className="shrink-0 h-4 w-4 mx-1.5 text-[var(--ds-gray-600)]" />

      {/* Element name */}
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editingName}
          onChange={(e) => onEditingNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => onFinishRename(editingName)}
          className="h-5 px-1 py-0 text-xs flex-1 min-w-0"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 min-w-0 truncate text-xs text-[var(--ds-gray-900)]">
          {element.name}
        </span>
      )}

      {/* Action buttons (visible on hover) */}
      <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Visibility toggle */}
        <button
          type="button"
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded",
            "hover:bg-[var(--ds-gray-200)] transition-colors"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          aria-label={element.hidden ? "Show element" : "Hide element"}
        >
          {element.hidden ? (
            <EyeOff className="h-3 w-3 text-[var(--ds-gray-500)]" />
          ) : (
            <Eye className="h-3 w-3 text-[var(--ds-gray-600)]" />
          )}
        </button>

        {/* Lock toggle */}
        <button
          type="button"
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded",
            "hover:bg-[var(--ds-gray-200)] transition-colors"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          aria-label={element.locked ? "Unlock element" : "Lock element"}
        >
          {element.locked ? (
            <Lock className="h-3 w-3 text-[var(--ds-gray-500)]" />
          ) : (
            <Unlock className="h-3 w-3 text-[var(--ds-gray-600)]" />
          )}
        </button>

        {/* More options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "w-5 h-5 flex items-center justify-center rounded",
                "hover:bg-[var(--ds-gray-200)] transition-colors"
              )}
              onClick={(e) => e.stopPropagation()}
              aria-label="More options"
            >
              <MoreHorizontal className="h-3 w-3 text-[var(--ds-gray-600)]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onStartRename}>
              Rename…
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onToggleVisibility}>
              {element.hidden ? "Show" : "Hide"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleLock}>
              {element.locked ? "Unlock" : "Lock"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN LAYERS PANEL COMPONENT
// ============================================================================

export function LayersPanel() {
  // Store state
  const page = useEditorStoreV2((s) => s.page);
  const selectedElementIds = useEditorStoreV2((s) => s.selectedElementIds);
  const hoveredElementId = useEditorStoreV2((s) => s.hoveredElementId);

  // Store actions
  const selectElement = useEditorStoreV2((s) => s.selectElement);
  const selectElements = useEditorStoreV2((s) => s.selectElements);
  const clearSelection = useEditorStoreV2((s) => s.clearSelection);
  const setHoveredElement = useEditorStoreV2((s) => s.setHoveredElement);
  const updateElement = useEditorStoreV2((s) => s.updateElement);
  const deleteElement = useEditorStoreV2((s) => s.deleteElement);
  const duplicateElement = useEditorStoreV2((s) => s.duplicateElement);
  const moveElement = useEditorStoreV2((s) => s.moveElement);

  // Handle hover state for canvas synchronization
  const handleMouseEnter = useCallback(
    (elementId: string) => {
      setHoveredElement(elementId);
    },
    [setHoveredElement]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredElement(null);
  }, [setHoveredElement]);

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [draggedItem, setDraggedItem] = useState<LayerItemData | null>(null);
  const [contextMenuElement, setContextMenuElement] = useState<VisualElement | null>(null);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Build flat list of elements with depth info
  const flattenedElements = useMemo(() => {
    if (!page) return [];

    const result: LayerItemData[] = [];
    const elements = page.elements;

    const traverse = (elementId: string, depth: number) => {
      const element = elements[elementId];
      if (!element) return;

      // Skip root element from display but process its children
      if (elementId === page.rootElementId) {
        element.children.forEach((childId) => traverse(childId, depth));
        return;
      }

      const hasChildren = element.children.length > 0;
      result.push({ element, depth, hasChildren });

      // Only traverse children if expanded
      if (hasChildren && expandedIds.has(elementId)) {
        element.children.forEach((childId) => traverse(childId, depth + 1));
      }
    };

    traverse(page.rootElementId, 0);
    return result;
  }, [page, expandedIds]);

  // Filter elements by search query
  const filteredElements = useMemo(() => {
    if (!searchQuery.trim()) return flattenedElements;

    const query = searchQuery.toLowerCase();
    return flattenedElements.filter(
      (item) =>
        item.element.name.toLowerCase().includes(query) ||
        item.element.type.toLowerCase().includes(query)
    );
  }, [flattenedElements, searchQuery]);

  // Get all element IDs for range selection
  const allElementIds = useMemo(
    () => flattenedElements.map((item) => item.element.id),
    [flattenedElements]
  );

  // Toggle expand/collapse
  const handleToggleExpand = useCallback((elementId: string) => {
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

  // Handle element selection with multi-select support
  const handleSelect = useCallback(
    (elementId: string, e: React.MouseEvent) => {
      if (e.shiftKey && lastSelectedId) {
        // Range selection
        const startIdx = allElementIds.indexOf(lastSelectedId);
        const endIdx = allElementIds.indexOf(elementId);
        if (startIdx !== -1 && endIdx !== -1) {
          const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
          const rangeIds = allElementIds.slice(from, to + 1);
          selectElements(rangeIds);
        }
      } else if (e.metaKey || e.ctrlKey) {
        // Toggle selection
        selectElement(elementId, "toggle");
      } else {
        // Replace selection
        selectElement(elementId, "replace");
      }
      setLastSelectedId(elementId);
    },
    [selectElement, selectElements, lastSelectedId, allElementIds]
  );

  // Handle visibility toggle
  const handleToggleVisibility = useCallback(
    (elementId: string) => {
      const element = page?.elements[elementId];
      if (element) {
        updateElement(elementId, { hidden: !element.hidden });
      }
    },
    [page, updateElement]
  );

  // Handle lock toggle
  const handleToggleLock = useCallback(
    (elementId: string) => {
      const element = page?.elements[elementId];
      if (element) {
        updateElement(elementId, { locked: !element.locked });
      }
    },
    [page, updateElement]
  );

  // Start renaming
  const handleStartRename = useCallback(
    (elementId: string) => {
      const element = page?.elements[elementId];
      if (element) {
        setEditingId(elementId);
        setEditingName(element.name);
      }
    },
    [page]
  );

  // Finish renaming
  const handleFinishRename = useCallback(
    (elementId: string, newName: string) => {
      if (newName.trim()) {
        updateElement(elementId, { name: newName.trim() });
      }
      setEditingId(null);
      setEditingName("");
    },
    [updateElement]
  );

  // Cancel renaming
  const handleCancelRename = useCallback(() => {
    setEditingId(null);
    setEditingName("");
  }, []);

  // Handle context menu
  const handleContextMenu = useCallback(
    (elementId: string, e: React.MouseEvent) => {
      e.preventDefault();
      const element = page?.elements[elementId];
      if (element) {
        setContextMenuElement(element);
        // Select the element if not already selected
        if (!selectedElementIds.includes(elementId)) {
          selectElement(elementId, "replace");
        }
      }
    },
    [page, selectedElementIds, selectElement]
  );

  // Context menu actions
  const handleDuplicate = useCallback(() => {
    selectedElementIds.forEach((id) => duplicateElement(id));
    setContextMenuElement(null);
  }, [selectedElementIds, duplicateElement]);

  const handleDelete = useCallback(() => {
    selectedElementIds.forEach((id) => deleteElement(id));
    setContextMenuElement(null);
  }, [selectedElementIds, deleteElement]);

  const handleMoveToFront = useCallback(() => {
    if (!page || selectedElementIds.length === 0) return;
    const elementId = selectedElementIds[0];
    const element = page.elements[elementId];
    if (element?.parentId) {
      const parent = page.elements[element.parentId];
      if (parent) {
        moveElement(elementId, element.parentId, parent.children.length - 1);
      }
    }
    setContextMenuElement(null);
  }, [page, selectedElementIds, moveElement]);

  const handleMoveToBack = useCallback(() => {
    if (!page || selectedElementIds.length === 0) return;
    const elementId = selectedElementIds[0];
    const element = page.elements[elementId];
    if (element?.parentId) {
      moveElement(elementId, element.parentId, 0);
    }
    setContextMenuElement(null);
  }, [page, selectedElementIds, moveElement]);

  // DnD handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const item = flattenedElements.find((i) => i.element.id === event.active.id);
      setDraggedItem(item || null);
    },
    [flattenedElements]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setDraggedItem(null);

      if (!over || active.id === over.id || !page) return;

      const activeElement = page.elements[active.id as string];
      const overElement = page.elements[over.id as string];

      if (!activeElement || !overElement) return;

      // Determine new parent and index
      const newParentId = overElement.parentId || page.rootElementId;
      const parent = page.elements[newParentId];

      if (parent) {
        const overIndex = parent.children.indexOf(over.id as string);
        moveElement(active.id as string, newParentId, overIndex);
      }
    },
    [page, moveElement]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected elements
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementIds.length > 0) {
        e.preventDefault();
        selectedElementIds.forEach((id) => deleteElement(id));
      }

      // Duplicate with Cmd/Ctrl+D
      if ((e.metaKey || e.ctrlKey) && e.key === "d" && selectedElementIds.length > 0) {
        e.preventDefault();
        selectedElementIds.forEach((id) => duplicateElement(id));
      }

      // Select all with Cmd/Ctrl+A
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        selectElements(allElementIds);
      }

      // Escape to clear selection
      if (e.key === "Escape") {
        clearSelection();
        handleCancelRename();
      }

      // Arrow navigation
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const currentIdx = lastSelectedId ? allElementIds.indexOf(lastSelectedId) : -1;
        const nextIdx =
          e.key === "ArrowDown"
            ? Math.min(currentIdx + 1, allElementIds.length - 1)
            : Math.max(currentIdx - 1, 0);

        if (nextIdx >= 0 && nextIdx < allElementIds.length) {
          const nextId = allElementIds[nextIdx];
          if (e.shiftKey) {
            selectElement(nextId, "add");
          } else {
            selectElement(nextId, "replace");
          }
          setLastSelectedId(nextId);
        }
      }

      // Expand/collapse with arrow keys
      if (e.key === "ArrowRight" && lastSelectedId) {
        const element = page?.elements[lastSelectedId];
        if (element && element.children.length > 0) {
          setExpandedIds((prev) => new Set([...prev, lastSelectedId]));
        }
      }
      if (e.key === "ArrowLeft" && lastSelectedId) {
        setExpandedIds((prev) => {
          const next = new Set(prev);
          next.delete(lastSelectedId);
          return next;
        });
      }

      // Rename with Enter or F2
      if ((e.key === "Enter" || e.key === "F2") && lastSelectedId && !editingId) {
        e.preventDefault();
        handleStartRename(lastSelectedId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedElementIds,
    allElementIds,
    lastSelectedId,
    editingId,
    page,
    deleteElement,
    duplicateElement,
    selectElement,
    selectElements,
    clearSelection,
    handleCancelRename,
    handleStartRename,
  ]);

  // Auto-expand parents of selected elements
  useEffect(() => {
    if (!page || selectedElementIds.length === 0) return;

    const parentsToExpand = new Set<string>();
    selectedElementIds.forEach((id) => {
      let current = page.elements[id];
      while (current?.parentId && current.parentId !== page.rootElementId) {
        parentsToExpand.add(current.parentId);
        current = page.elements[current.parentId];
      }
    });

    if (parentsToExpand.size > 0) {
      setExpandedIds((prev) => new Set([...prev, ...parentsToExpand]));
    }
  }, [page, selectedElementIds]);

  if (!page) {
    return (
      <div className="flex flex-col h-full bg-[var(--ds-background)] border-r border-[var(--ds-gray-200)]">
        <div className="p-4 text-center text-sm text-[var(--ds-gray-600)]">
          No page loaded
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full bg-[var(--ds-background)] border-r border-[var(--ds-gray-200)]"
      role="tree"
      aria-label="Page layers"
    >
      {/* Header */}
      <div className="shrink-0 px-3 py-2 border-b border-[var(--ds-gray-200)]">
        <h2 className="text-xs font-medium text-[var(--ds-gray-900)] mb-2">Layers</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ds-gray-500)]" />
          <Input
            type="text"
            placeholder="Search layers…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-xs bg-[var(--ds-gray-100)] border-[var(--ds-gray-200)]"
          />
        </div>
      </div>

      {/* Layers list */}
      <ScrollArea className="flex-1">
        <div className="p-1">
          {filteredElements.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--ds-gray-500)]">
              {searchQuery ? "No matching layers" : "No layers yet"}
            </div>
          ) : (
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={filteredElements.map((i) => i.element.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {filteredElements.map((item) => (
                        <LayerItem
                          key={item.element.id}
                          item={item}
                          isSelected={selectedElementIds.includes(item.element.id)}
                          isHovered={hoveredElementId === item.element.id}
                          isExpanded={expandedIds.has(item.element.id)}
                          isEditing={editingId === item.element.id}
                          editingName={editingId === item.element.id ? editingName : ""}
                          onSelect={(e) => handleSelect(item.element.id, e)}
                          onToggleExpand={() => handleToggleExpand(item.element.id)}
                          onToggleVisibility={() => handleToggleVisibility(item.element.id)}
                          onToggleLock={() => handleToggleLock(item.element.id)}
                          onStartRename={() => handleStartRename(item.element.id)}
                          onFinishRename={(name) => handleFinishRename(item.element.id, name)}
                          onCancelRename={handleCancelRename}
                          onEditingNameChange={setEditingName}
                          onContextMenu={(e) => handleContextMenu(item.element.id, e)}
                          onMouseEnter={() => handleMouseEnter(item.element.id)}
                          onMouseLeave={handleMouseLeave}
                        />
                      ))}
                    </SortableContext>

                    {/* Drag overlay */}
                    <DragOverlay>
                      {draggedItem && (
                        <LayerItem
                          item={draggedItem}
                          isSelected={false}
                          isHovered={false}
                          isExpanded={false}
                          isEditing={false}
                          editingName=""
                          onSelect={() => {}}
                          onToggleExpand={() => {}}
                          onToggleVisibility={() => {}}
                          onToggleLock={() => {}}
                          onStartRename={() => {}}
                          onFinishRename={() => {}}
                          onCancelRename={() => {}}
                          onEditingNameChange={() => {}}
                          onContextMenu={() => {}}
                          onMouseEnter={() => {}}
                          onMouseLeave={() => {}}
                          isDragOverlay
                        />
                      )}
                    </DragOverlay>
                  </DndContext>
                </div>
              </ContextMenuTrigger>

              {/* Context menu */}
              <ContextMenuContent className="w-48">
                <ContextMenuItem
                  onClick={() => contextMenuElement && handleStartRename(contextMenuElement.id)}
                >
                  Rename…
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={handleDelete}
                  className="text-[var(--ds-red-700)]"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem disabled>
                  <Group className="h-4 w-4 mr-2" />
                  Group
                </ContextMenuItem>
                <ContextMenuItem disabled>
                  <Ungroup className="h-4 w-4 mr-2" />
                  Ungroup
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={handleMoveToFront}>
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Move to front
                </ContextMenuItem>
                <ContextMenuItem onClick={handleMoveToBack}>
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Move to back
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="shrink-0 px-3 py-1.5 border-t border-[var(--ds-gray-200)]">
        <div className="text-[10px] text-[var(--ds-gray-500)] text-center">
          {selectedElementIds.length > 1 ? (
            <span className="text-[var(--ds-blue-700)] font-medium">
              {selectedElementIds.length} selected
            </span>
          ) : (
            <span>
              {Object.keys(page.elements).length - 1} layer
              {Object.keys(page.elements).length - 1 !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default LayersPanel;
