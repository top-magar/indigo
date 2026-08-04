import React from "react";
import { type ElementDef, register as registerElement } from "@/features/editor/core/registry/types";
import { type El } from "@/features/editor/core/types";
import { Plug } from "lucide-react";

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
