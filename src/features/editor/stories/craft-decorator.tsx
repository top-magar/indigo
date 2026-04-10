import React from "react";
import { Editor, Frame, Element } from "@craftjs/core";
import { resolver } from "../resolver";
import { Container } from "../blocks/container";
import { EditorActiveProvider } from "../hooks/use-node-safe";
import type { DecoratorFunction } from "storybook/internal/types";
import type { ReactRenderer } from "@storybook/react";

/**
 * Storybook decorator that wraps stories in a Craft.js Editor context.
 * Use for any component that calls useNode() or useEditor().
 */
export const withCraftEditor: DecoratorFunction<ReactRenderer> = (Story) => (
  <Editor resolver={resolver}>
    <EditorActiveProvider>
      <Frame>
        <Element canvas is={Container as React.ElementType}>
          <Story />
        </Element>
      </Frame>
    </EditorActiveProvider>
  </Editor>
);

/**
 * Minimal Craft.js wrapper — just the Editor context, no Frame.
 * Use for components that only need useEditor() (not useNode()).
 */
export const withCraftEditorOnly: DecoratorFunction<ReactRenderer> = (Story) => (
  <Editor resolver={resolver}>
    <EditorActiveProvider>
      <Story />
    </EditorActiveProvider>
  </Editor>
);
