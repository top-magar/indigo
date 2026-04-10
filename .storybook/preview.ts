import type { Preview, ReactRenderer } from "@storybook/react";
import type { DecoratorFunction } from "storybook/internal/types";
import "../src/app/globals.css";

/** Decorator that applies dark class to the body based on toolbar selection */
const withTheme: DecoratorFunction<ReactRenderer> = (Story, context) => {
  const theme = context.globals.theme || "light";
  document.documentElement.classList.toggle("dark", theme === "dark");
  return Story();
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    layout: "centered",
    viewport: {
      viewports: {
        mobile: { name: "Mobile", styles: { width: "375px", height: "812px" } },
        tablet: { name: "Tablet", styles: { width: "768px", height: "1024px" } },
        desktop: { name: "Desktop", styles: { width: "1280px", height: "800px" } },
      },
    },
    a11y: { element: "#storybook-root" },
  },
};

export default preview;
