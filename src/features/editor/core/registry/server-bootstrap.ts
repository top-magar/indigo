/**
 * Server-safe registry bootstrap.
 *
 * Registers every element definition and plugin WITHOUT importing the
 * canvas-only client renderers (renderers.tsx pulls in framer-motion,
 * radix context-menu, ElementWrapper, etc.). The storefront renderer runs
 * inside React Server Components, so it imports this module to get the
 * element registry populated without dragging the editor client graph
 * into the storefront bundle.
 *
 * The client entrypoint (registry/index.ts) imports this module first and
 * then layers the canvas renderers on top. Registration is idempotent —
 * `register()` just sets a Map entry, so both paths can safely share it.
 */
import "./elements/layout";
import "./elements/typography";
import "./elements/media";
import "./elements/interactive";
import "./elements/embed";
import "./elements/navigation";
import "./elements/forms";
import "./elements/blocks";
import "./elements/ecommerce";
import "./elements/marketing";
import { registerPlugins } from "@/plugins";

registerPlugins();
