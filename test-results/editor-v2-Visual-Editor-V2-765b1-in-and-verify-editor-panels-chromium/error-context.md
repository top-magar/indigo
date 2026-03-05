# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e4]:
    - img [ref=e6]
    - heading "404" [level=1] [ref=e11]
    - heading "Page not found" [level=2] [ref=e12]
    - paragraph [ref=e13]: The page you're looking for doesn't exist or has been moved.
    - link "Back to home" [ref=e14] [cursor=pointer]:
      - /url: /
      - img
      - text: Back to home
  - button "Open Next.js Dev Tools" [ref=e20] [cursor=pointer]:
    - img [ref=e21]
  - alert [ref=e24]
```