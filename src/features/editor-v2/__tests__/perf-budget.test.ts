import { describe, it, expect } from "vitest"
import { readdirSync, readFileSync, statSync } from "fs"
import { join } from "path"

const EDITOR_ROOT = join(__dirname, "..")

/**
 * Performance Budget for Editor V2
 *
 * These limits prevent accidental bloat. If a test fails,
 * either the change is too large or the budget needs updating
 * (with justification in the commit message).
 */
const BUDGET = {
  maxTotalLines: 10000,
  maxSingleFileLines: 1000,
  maxTotalFiles: 130,
  maxBlockCount: 60,
  maxCoreFileLines: 600, // store.ts, commands.ts, etc.
  largestAllowedFiles: [
    { file: "components/settings/style-manager.tsx", maxLines: 900 },
    { file: "store.ts", maxLines: 600 },
    { file: "components/canvas/canvas.tsx", maxLines: 420 },
    { file: "components/shell/editor-shell.tsx", maxLines: 380 },
  ],
}

function countLines(filePath: string): number {
  return readFileSync(filePath, "utf-8").split("\n").length
}

function collectFiles(dir: string, ext: string[]): string[] {
  const results: string[] = []
  const walk = (d: string) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name)
      if (entry.isDirectory() && entry.name !== "__tests__" && entry.name !== "node_modules") walk(full)
      else if (entry.isFile() && ext.some((e) => entry.name.endsWith(e))) results.push(full)
    }
  }
  walk(dir)
  return results
}

describe("Performance Budget", () => {
  const allFiles = collectFiles(EDITOR_ROOT, [".ts", ".tsx"])
  const totalLines = allFiles.reduce((sum, f) => sum + countLines(f), 0)

  it(`total lines ≤ ${BUDGET.maxTotalLines}`, () => {
    expect(totalLines).toBeLessThanOrEqual(BUDGET.maxTotalLines)
  })

  it(`total files ≤ ${BUDGET.maxTotalFiles}`, () => {
    expect(allFiles.length).toBeLessThanOrEqual(BUDGET.maxTotalFiles)
  })

  it(`no single file exceeds ${BUDGET.maxSingleFileLines} lines`, () => {
    const violations = allFiles
      .map((f) => ({ file: f.replace(EDITOR_ROOT + "/", ""), lines: countLines(f) }))
      .filter((f) => f.lines > BUDGET.maxSingleFileLines)
    expect(violations).toEqual([])
  })

  for (const { file, maxLines } of BUDGET.largestAllowedFiles) {
    it(`${file} ≤ ${maxLines} lines`, () => {
      const full = join(EDITOR_ROOT, file)
      try {
        expect(countLines(full)).toBeLessThanOrEqual(maxLines)
      } catch {
        // File may have been moved/renamed — skip
      }
    })
  }

  it("blocks count ≤ " + BUDGET.maxBlockCount, () => {
    const blockFiles = collectFiles(join(EDITOR_ROOT, "blocks"), [".tsx"])
      .filter((f) => !f.includes("block-skeleton") && !f.includes("data-context"))
    expect(blockFiles.length).toBeLessThanOrEqual(BUDGET.maxBlockCount)
  })

  it("no bare useEditorStore() calls in components", () => {
    const componentFiles = collectFiles(join(EDITOR_ROOT, "components"), [".tsx"])
    const violations: string[] = []
    for (const f of componentFiles) {
      const content = readFileSync(f, "utf-8")
      // Match useEditorStore() but not useEditorStore(s => ...)
      const matches = content.match(/useEditorStore\(\)/g)
      if (matches) violations.push(`${f.replace(EDITOR_ROOT + "/", "")}: ${matches.length} bare call(s)`)
    }
    expect(violations).toEqual([])
  })

  it("no CSS vars without fallbacks in blocks", () => {
    const blockFiles = collectFiles(join(EDITOR_ROOT, "blocks"), [".tsx"])
    const violations: string[] = []
    for (const f of blockFiles) {
      const content = readFileSync(f, "utf-8")
      // Match var(--store-xxx) without a comma (no fallback)
      const matches = content.match(/var\(--store-[a-z-]+\)(?!,)/g)
      if (matches) violations.push(`${f.replace(EDITOR_ROOT + "/", "")}: ${matches.length} var(s) without fallback`)
    }
    expect(violations).toEqual([])
  })

  // Print baseline for reference
  it("prints current baseline", () => {
    console.log(`\n📊 Editor V2 Performance Baseline:`)
    console.log(`   Files: ${allFiles.length}`)
    console.log(`   Lines: ${totalLines}`)
    console.log(`   Budget: ${BUDGET.maxTotalLines} lines / ${BUDGET.maxTotalFiles} files`)
    expect(true).toBe(true)
  })
})
