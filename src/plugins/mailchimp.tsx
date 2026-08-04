import React from "react";
import { createPlugin } from "./sdk";
import { Mail } from "lucide-react";

export const mailchimpPlugin = createPlugin({
  id: "mailchimp_subscribe",
  name: "Mailchimp Form",
  icon: Mail as any,
  defaultStyles: {
    padding: "20px",
    backgroundColor: "#f4f4f5",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "100%",
  },
  props: {
    endpoint: {
      type: "string",
      label: "API Endpoint",
      defaultValue: "https://mailchimp.com/...",
    },
    buttonText: {
      type: "string",
      label: "Button Text",
      defaultValue: "Subscribe",
    },
    placeholderText: {
      type: "string",
      label: "Placeholder",
      defaultValue: "Email address",
    },
  },
  component: ({ props, styles }) => {
    return (
      <div style={styles} className="mailchimp-plugin-container">
        <div style={{ fontWeight: 600, fontSize: "14px" }}>Join our newsletter</div>
        <form 
          style={{ display: "flex", gap: "8px", width: "100%" }} 
          onSubmit={(e) => e.preventDefault()}
        >
          <input 
            type="email" 
            placeholder={props.placeholderText} 
            style={{ 
              flex: 1, 
              padding: "8px 12px", 
              borderRadius: "4px", 
              border: "1px solid #d4d4d8",
              outline: "none"
            }} 
            disabled 
          />
          <button 
            type="button" 
            style={{ 
              backgroundColor: "#18181b", 
              color: "#fff", 
              padding: "8px 16px", 
              borderRadius: "4px", 
              fontWeight: 500,
              cursor: "pointer",
              border: "none"
            }}
          >
            {props.buttonText}
          </button>
        </form>
      </div>
    );
  },
  exportHTML: (props, styles) => {
    // Generate inline styles string from the React CSSProperties object
    const styleString = Object.entries(styles)
      .map(([k, v]) => `${k.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}: ${v}`)
      .join('; ');

    return `
      <div class="mailchimp-plugin-container" style="${styleString}">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 12px;">Join our newsletter</div>
        <form action="${props.endpoint}" method="POST" style="display: flex; gap: 8px; width: 100%;">
          <input type="email" name="EMAIL" placeholder="${props.placeholderText}" style="flex: 1; padding: 8px 12px; border-radius: 4px; border: 1px solid #d4d4d8;" required />
          <button type="submit" style="background-color: #18181b; color: #fff; padding: 8px 16px; border-radius: 4px; font-weight: 500; border: none;">
            ${props.buttonText}
          </button>
        </form>
      </div>
    `;
  }
});
