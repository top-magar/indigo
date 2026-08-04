import React from "react";
import { type ElementDef, register as registerElement } from "@/features/editor/core/registry/types";
import { type El } from "@/features/editor/core/types";
import { Plug } from "lucide-react";
import { safeUrl } from "@/shared/utils/safe-url";

/**
 * Definition of a custom property that will be exposed in the editor UI.
 */
export type PluginPropType = "string" | "number" | "boolean" | "color" | "select";

export interface PluginPropDef {
  type: PluginPropType;
  label: string;
  defaultValue: any;
  options?: string[]; // For 'select' type
}

export interface PluginConfig {
  /** A unique identifier for the plugin (e.g., 'acme_reviews') */
  id: string;
  /** The display name of the plugin in the elements panel */
  name: string;
  /** The icon to display. Defaults to a plug icon. */
  icon?: any;
  /** The default CSS properties for the plugin container */
  defaultStyles?: Record<string, string>;
  /** The properties that the user can configure in the right sidebar */
  props?: Record<string, PluginPropDef>;
  /** The React component to render */
  component: React.FC<{ props: Record<string, any>; styles: React.CSSProperties }>;
  /** A function that returns raw HTML string for the published site */
  exportHTML: (props: Record<string, any>, styles: Record<string, string>) => string;
}

/**
 * Factory function to create a new Plugin definition compatible with Indigo.
 */
export function createPlugin(config: PluginConfig): ElementDef {
  const defaultContent: Record<string, any> = {};
  
  if (config.props) {
    for (const [key, def] of Object.entries(config.props)) {
      defaultContent[key] = def.defaultValue;
    }
  }

  return {
    type: config.id,
    name: config.name,
    icon: config.icon || Plug,
    color: "text-indigo-500",
    group: "Plugins",
    isContainer: false,
    pluginProps: config.props,
    factory: () => ({
      id: crypto.randomUUID(),
      type: config.id,
      name: config.name,
      styles: config.defaultStyles || { width: "100%", display: "block" },
      content: { ...defaultContent },
    }),
    render: ({ element }) => {
      const content = element.content as Record<string, any>;
      return (
        <config.component 
          props={content} 
          styles={element.styles as React.CSSProperties} 
        />
      );
    },
    /**
     * Default live-storefront renderer (server-safe, no hooks).
     * Renders a simple form: the first safe http(s) prop becomes the action,
     * string props become inputs, and a submit button labels itself from a
     * `buttonText` prop when present. Plugins that need exact markup should
     * provide their own `storefrontRender` (see mailchimp.tsx).
     */
    storefrontRender: ({ element }) => {
      const content = element.content as Record<string, any>;
      const styles = element.styles as React.CSSProperties;
      const entries = Object.entries(content).filter(([, v]) => typeof v === "string" && v !== "");
      const action = entries.find(([, v]) => safeUrl(v))?.[1] ?? undefined;
      return (
        <form action={action} method="POST" style={styles}>
          {entries
            .filter(([key, value]) => key !== "buttonText" && safeUrl(value) !== value)
            .map(([key, value]) => (
              <input key={key} name={key} defaultValue={value} placeholder={value} style={{ display: "block", width: "100%", marginBottom: 8, padding: "8px 12px", borderRadius: 4, border: "1px solid #d4d4d8", boxSizing: "border-box" }} />
            ))}
          <button type="submit" style={{ backgroundColor: "#18181b", color: "#fff", padding: "8px 16px", borderRadius: 4, fontWeight: 500, border: "none", cursor: "pointer" }}>
            {content.buttonText || "Submit"}
          </button>
        </form>
      );
    },
    exportHTML: (el: El) => {
      const content = el.content as Record<string, any>;
      return config.exportHTML(content, el.styles as Record<string, string>);
    }
  };
}

/**
 * Register a created plugin with the editor registry.
 */
export function registerPlugin(plugin: ElementDef) {
  registerElement(plugin);
}
