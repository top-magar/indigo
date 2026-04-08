/** Default Craft.js JSON for new pages — header + empty body + footer */
export function defaultPageJson(): string {
  return JSON.stringify({
    ROOT: {
      type: { resolvedName: "Container" },
      isCanvas: true,
      props: { padding: 0, background: "transparent" },
      nodes: ["_header", "_body", "_footer"],
    },
    _header: {
      type: { resolvedName: "HeaderBlock" },
      parent: "ROOT",
      props: { _v: 1, storeName: "My Store", logoUrl: "", logoWidth: 100, links: "Shop:/products, About:/about, Contact:/contact", backgroundColor: "", textColor: "", sticky: false, showSeparator: true, height: 64, paddingX: 24, layout: "default", hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false },
      nodes: [],
    },
    _body: {
      type: { resolvedName: "Container" },
      isCanvas: true,
      parent: "ROOT",
      props: { padding: 0, background: "transparent" },
      nodes: [],
    },
    _footer: {
      type: { resolvedName: "FooterBlock" },
      parent: "ROOT",
      props: { _v: 1, storeName: "My Store", columns: [], backgroundColor: "#111827", textColor: "#f9fafb", showNewsletter: true, newsletterHeading: "Stay Updated", showSocial: true, socialLinks: [], showPaymentIcons: true, copyright: "", paddingTop: 48, paddingBottom: 32, hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false },
      nodes: [],
    },
  })
}
