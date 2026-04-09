import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: { name: "@storybook/nextjs", options: {} },
  staticDirs: ["../public"],
  typescript: { reactDocgen: false },
};

export default config;
