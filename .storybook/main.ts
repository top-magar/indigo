import type { StorybookConfig } from "@storybook/nextjs";

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
    };
    return config;
  },
};

export default config;
