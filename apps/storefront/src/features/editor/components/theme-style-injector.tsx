/** Injects theme CSS custom properties into the editor canvas */
export function ThemeStyleInjector({ customCss }: { customCss?: string }) {
  return (
    <>
      <style>{`
        [data-craft-node-id] h1,[data-craft-node-id] h2,[data-craft-node-id] h3,[data-craft-node-id] h4 {
          letter-spacing: var(--store-heading-tracking, 0em);
          font-size: calc(1em * var(--store-heading-scale, 100) / 100);
        }
        [data-craft-node-id] { line-height: var(--store-body-leading, 1.6); }
        [data-craft-node-id] > [data-craft-node-id] {
          margin-bottom: var(--store-section-gap-v, 48px);
          padding-left: var(--store-section-gap-h, 24px);
          padding-right: var(--store-section-gap-h, 24px);
        }
        [data-craft-node-id] [data-craft-node-id] > div { max-width: var(--store-max-width, none); margin-left: auto; margin-right: auto; }
      `}</style>
      {!!customCss && <style>{customCss}</style>}
    </>
  )
}
