import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  framework: { name: "@storybook/nextjs", options: {} },
  staticDirs: ["../public"],
  typescript: { reactDocgen: false },
};

export default config;
