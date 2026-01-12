"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";
import { cn } from "@/shared/utils";

// Types
export interface FileTreeNode {
  name: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  icon?: React.ReactNode;
}

export interface FileTreeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  data: FileTreeNode[];
  defaultExpanded?: boolean;
  onSelect?: (node: FileTreeNode) => void;
}

export interface FileTreeItemProps {
  node: FileTreeNode;
  level: number;
  defaultExpanded?: boolean;
  onSelect?: (node: FileTreeNode) => void;
}

const fileTreeVariants = cva(
  "font-mono text-sm select-none",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const fileTreeItemVariants = cva(
  "flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer transition-colors",
  {
    variants: {
      type: {
        file: "hover:bg-[var(--ds-gray-200)] dark:hover:bg-[var(--ds-gray-800)]",
        folder: "hover:bg-[var(--ds-gray-200)] dark:hover:bg-[var(--ds-gray-800)] font-medium",
      },
    },
    defaultVariants: {
      type: "file",
    },
  }
);

const FileTreeItem = React.forwardRef<HTMLDivElement, FileTreeItemProps>(
  ({ node, level, defaultExpanded = false, onSelect }, ref) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
    const hasChildren = node.type === "folder" && node.children && node.children.length > 0;

    const handleClick = () => {
      if (node.type === "folder") {
        setIsExpanded(!isExpanded);
      }
      onSelect?.(node);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
      if (e.key === "ArrowRight" && node.type === "folder" && !isExpanded) {
        e.preventDefault();
        setIsExpanded(true);
      }
      if (e.key === "ArrowLeft" && node.type === "folder" && isExpanded) {
        e.preventDefault();
        setIsExpanded(false);
      }
    };

    const DefaultIcon = node.type === "folder" ? Folder : File;
    const icon = node.icon || <DefaultIcon className="size-4 text-[var(--ds-gray-900)] dark:text-[var(--ds-gray-100)]" />;

    return (
      <div ref={ref}>
        <div
          role="treeitem"
          aria-expanded={node.type === "folder" ? isExpanded : undefined}
          aria-selected={false}
          tabIndex={0}
          className={cn(fileTreeItemVariants({ type: node.type }))}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          {node.type === "folder" && (
            <span className="flex-shrink-0 text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-400)]">
              {isExpanded ? (
                <ChevronDown className="size-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="size-4" aria-hidden="true" />
              )}
            </span>
          )}
          {node.type === "file" && <span className="w-4" aria-hidden="true" />}
          <span className="flex-shrink-0">{icon}</span>
          <span className="truncate text-[var(--ds-gray-1000)] dark:text-[var(--ds-gray-100)]">
            {node.name}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div role="group">
            {node.children!.map((child, index) => (
              <FileTreeItem
                key={`${child.name}-${index}`}
                node={child}
                level={level + 1}
                defaultExpanded={defaultExpanded}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);
FileTreeItem.displayName = "FileTreeItem";

const FileTree = React.forwardRef<
  HTMLDivElement,
  FileTreeProps & VariantProps<typeof fileTreeVariants>
>(({ className, data, defaultExpanded = false, onSelect, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="tree"
      aria-label="File tree"
      className={cn(
        fileTreeVariants(),
        "rounded-lg border border-[var(--ds-gray-400)] dark:border-[var(--ds-gray-700)] bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-900)] p-2",
        className
      )}
      {...props}
    >
      {data.map((node, index) => (
        <FileTreeItem
          key={`${node.name}-${index}`}
          node={node}
          level={0}
          defaultExpanded={defaultExpanded}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
});
FileTree.displayName = "FileTree";

export { FileTree, FileTreeItem, fileTreeVariants };
