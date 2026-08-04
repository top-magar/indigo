/**
 * Plugin Registration Entrypoint
 * 
 * Third-party developers can register their custom React blocks here.
 * These blocks will automatically appear in the visual editor.
 */

import { register } from "@/features/editor/core/registry/types";
import { mailchimpPlugin } from "./mailchimp";

// Register external plugins
export function registerPlugins() {
  register(mailchimpPlugin);
}
