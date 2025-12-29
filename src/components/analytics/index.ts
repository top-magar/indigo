/**
 * Analytics Components
 * 
 * Provides Web Vitals tracking and page view analytics.
 * 
 * Usage in root layout:
 * ```tsx
 * import { WebVitals, PageViewTracker } from "@/components/analytics"
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <WebVitals />
 *         <Suspense fallback={null}>
 *           <PageViewTracker />
 *         </Suspense>
 *         {children}
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 * 
 * @see https://nextjs.org/docs/app/guides/analytics
 */

export { WebVitals, sendToGoogleAnalytics, sendToVercelAnalytics } from "./web-vitals"
export { PageViewTracker, trackEvent } from "./page-view-tracker"
