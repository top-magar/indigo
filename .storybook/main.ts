import type { StorybookConfig } from "@storybook/nextjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y"],
  framework: { name: "@storybook/nextjs", options: {} },
  staticDirs: ["../public"],
  typescript: { reactDocgen: false },
  webpackFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      dns: false,
      perf_hooks: false,
      crypto: false,
      stream: false,
      os: false,
      path: false,
      zlib: false,
      http: false,
      https: false,
      child_process: false,
    };
    // Stub postgres to avoid Node built-in imports
    config.resolve.alias = {
      ...config.resolve.alias,
      postgres: path.resolve(__dirname, "stubs/postgres.ts"),
    };
    return config;
  },
};

export default config;
