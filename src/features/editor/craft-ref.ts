import type { RefCallback } from "react"

/**
 * Wraps a Craft.js connector (which returns HTMLElement) into a
 * React 19-compatible ref callback (which must return void | Cleanup).
 */
export function craftRef(
  ...fns: Array<(el: HTMLElement) => HTMLElement | void>
): RefCallback<HTMLElement> {
  return (el) => {
    if (el) fns.forEach((fn) => fn(el))
  }
}
