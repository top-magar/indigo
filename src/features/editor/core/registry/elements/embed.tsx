import React from "react";
import { register } from "../types";
import { type El } from "../../types";
import { Code } from "lucide-react";

register({
  type: "embed",
  name: "HTML Embed",
  icon: Code as any,
  color: "text-rose-500",
  group: "Interactive",
  isContainer: false,
  factory: () => ({
    id: crypto.randomUUID(),
    type: "embed",
    name: "HTML Embed",
    styles: {
      width: "100%",
    },
    content: {
      code: "<!-- Paste your custom HTML/JS/CSS here -->\n<div style=\"padding: 20px; background: #f3f4f6; text-align: center; border-radius: 8px;\">\n  <h3>Custom Code Block</h3>\n</div>",
    },
  }),
  render: ({ element }) => {
    const content = element.content as Record<string, string>;
    const code = content?.code || "";

    return (
      <div 
        style={element.styles as React.CSSProperties} 
        className="w-full relative"
      >
        {/* We render dangerouslySetInnerHTML. To be safe in the editor, we pointer-events-none it so the user can still select it without child elements capturing clicks */}
        <div 
          className="pointer-events-none" 
          dangerouslySetInnerHTML={{ __html: code }} 
        />
      </div>
    );
  },
  exportHTML: (el: El) => {
    const content = el.content as Record<string, string>;
    const code = content?.code || "";
    // Export raw code (the user is responsible for ensuring it's valid and safe)
    return `
      <div style="width: ${el.styles.width || '100%'}">
        ${code}
      </div>
    `;
  }
});
