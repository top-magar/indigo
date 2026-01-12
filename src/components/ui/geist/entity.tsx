"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

const entityVariants = cva(
  "flex items-center gap-3",
  {
    variants: {
      size: {
        sm: "gap-2",
        md: "gap-3",
        lg: "gap-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const entityAvatarVariants = cva(
  "flex-shrink-0 rounded-full overflow-hidden bg-[var(--ds-gray-200)] dark:bg-[var(--ds-gray-800)] flex items-center justify-center",
  {
    variants: {
      size: {
        sm: "size-8",
        md: "size-10",
        lg: "size-12",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const entityThumbnailVariants = cva(
  "flex-shrink-0 rounded-lg overflow-hidden bg-[var(--ds-gray-200)] dark:bg-[var(--ds-gray-800)]",
  {
    variants: {
      size: {
        sm: "size-8",
        md: "size-10",
        lg: "size-12",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const entityNameVariants = cva(
  "font-medium text-[var(--ds-gray-1000)] dark:text-[var(--ds-gray-100)] truncate",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const entityDescriptionVariants = cva(
  "text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-400)] truncate",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-xs",
        lg: "text-sm",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface EntityProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof entityVariants> {
  name: string;
  description?: string;
  avatar?: string | React.ReactNode;
  thumbnail?: string;
}

const EntityAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    src?: string;
    alt?: string;
    fallback?: React.ReactNode;
    size?: "sm" | "md" | "lg";
  }
>(({ className, src, alt, fallback, size = "md", ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false);

  return (
    <div
      ref={ref}
      className={cn(entityAvatarVariants({ size }), className)}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="size-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        fallback || (
          <span className="text-[var(--ds-gray-600)] dark:text-[var(--ds-gray-500)] text-sm font-medium">
            {alt?.charAt(0)?.toUpperCase() || "?"}
          </span>
        )
      )}
    </div>
  );
});
EntityAvatar.displayName = "EntityAvatar";

const EntityThumbnail = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    src: string;
    alt?: string;
    size?: "sm" | "md" | "lg";
  }
>(({ className, src, alt, size = "md", ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false);

  return (
    <div
      ref={ref}
      className={cn(entityThumbnailVariants({ size }), className)}
      {...props}
    >
      {!hasError ? (
        <img
          src={src}
          alt={alt || "Thumbnail"}
          className="size-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="size-full flex items-center justify-center text-[var(--ds-gray-500)]">
          <svg
            className="size-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
});
EntityThumbnail.displayName = "EntityThumbnail";

const EntityContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col min-w-0", className)}
    {...props}
  >
    {children}
  </div>
));
EntityContent.displayName = "EntityContent";

const EntityName = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    size?: "sm" | "md" | "lg";
  }
>(({ className, size = "md", children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(entityNameVariants({ size }), className)}
    {...props}
  >
    {children}
  </span>
));
EntityName.displayName = "EntityName";

const EntityDescription = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    size?: "sm" | "md" | "lg";
  }
>(({ className, size = "md", children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(entityDescriptionVariants({ size }), className)}
    {...props}
  >
    {children}
  </span>
));
EntityDescription.displayName = "EntityDescription";

const Entity = React.forwardRef<HTMLDivElement, EntityProps>(
  ({ className, name, description, avatar, thumbnail, size = "md", ...props }, ref) => {
    const resolvedSize = size ?? "md";
    
    const renderAvatar = () => {
      if (thumbnail) {
        return <EntityThumbnail src={thumbnail} alt={name} size={resolvedSize} />;
      }

      if (typeof avatar === "string") {
        return <EntityAvatar src={avatar} alt={name} size={resolvedSize} />;
      }

      if (React.isValidElement(avatar)) {
        return (
          <div className={cn(entityAvatarVariants({ size: resolvedSize }))}>
            {avatar}
          </div>
        );
      }

      return <EntityAvatar alt={name} size={resolvedSize} />;
    };

    return (
      <div
        ref={ref}
        className={cn(entityVariants({ size: resolvedSize }), className)}
        {...props}
      >
        {renderAvatar()}
        <EntityContent>
          <EntityName size={resolvedSize}>{name}</EntityName>
          {description && (
            <EntityDescription size={resolvedSize}>{description}</EntityDescription>
          )}
        </EntityContent>
      </div>
    );
  }
);
Entity.displayName = "Entity";

export {
  Entity,
  EntityAvatar,
  EntityThumbnail,
  EntityContent,
  EntityName,
  EntityDescription,
  entityVariants,
};
