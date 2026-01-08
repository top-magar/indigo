export const siteConfig = {
    name: "Indigo",
    description: "Multi-tenant e-commerce platform for Nepal",
    url: process.env.NEXT_PUBLIC_APP_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
    ogImage: "/og.png",
    links: {
        twitter: "https://twitter.com/indigo",
        github: "https://github.com/indigo",
    },
} as const;

export type SiteConfig = typeof siteConfig;
