"use client"
import Script from "next/script"
import DOMPurify from "isomorphic-dompurify"

interface Props { gaId?: string; fbPixelId?: string; headCode?: string; bodyCode?: string }

/** Sanitize custom code — allow only safe HTML, strip all scripts */
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { FORBID_TAGS: ["script", "iframe", "object", "embed", "form"], FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"] })
}

export function AnalyticsScripts({ gaId, fbPixelId, headCode, bodyCode }: Props) {
  return (
    <>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId.replace(/[^a-zA-Z0-9-]/g, "")}')`}</Script>
        </>
      )}
      {fbPixelId && (
        <Script id="fb" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbPixelId.replace(/[^a-zA-Z0-9]/g, "")}');fbq('track','PageView')`}</Script>
      )}
      {headCode && <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(headCode) }} />}
      {bodyCode && <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(bodyCode) }} />}
    </>
  )
}
