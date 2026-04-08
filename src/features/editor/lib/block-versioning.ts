/**
 * Block Schema Versioning
 *
 * Every block stores `_v` in its Craft.js props. When block schemas change,
 * bump the version and add a migration function here.
 *
 * Current versions: all blocks start at v1.
 */

export const CURRENT_BLOCK_VERSION = 1

type MigrationFn = (props: Record<string, any>) => Record<string, any>
type Migrations = Record<string, Record<number, MigrationFn>>

/**
 * Register migrations here when block schemas change.
 * Key: block resolvedName, Value: { fromVersion: migrateFn }
 *
 * Example:
 *   HeroBlock: {
 *     1: (props) => ({ ...props, newField: "default", _v: 2 }),
 *   }
 */
const migrations: Migrations = {
  // No migrations yet — all blocks are at v1
}

/**
 * Migrate a single block's props to the current version.
 * Returns props unchanged if already current or no migrations exist.
 */
export function migrateBlockProps(
  resolvedName: string,
  props: Record<string, any>
): Record<string, any> {
  let version = props._v ?? 0
  const blockMigrations = migrations[resolvedName]
  if (!blockMigrations) {
    return { ...props, _v: CURRENT_BLOCK_VERSION }
  }

  let migrated = { ...props }
  while (version < CURRENT_BLOCK_VERSION && blockMigrations[version]) {
    migrated = blockMigrations[version](migrated)
    version = migrated._v ?? version + 1
  }
  migrated._v = CURRENT_BLOCK_VERSION
  return migrated
}

/**
 * Walk a serialized Craft.js JSON tree and migrate all block props.
 * Safe to call on every render — no-ops if all blocks are current.
 */
export function migrateCraftJson(craftJson: string): string {
  let tree: Record<string, any>
  try {
    tree = JSON.parse(craftJson)
  } catch {
    return craftJson
  }

  let changed = false
  for (const [nodeId, node] of Object.entries(tree)) {
    const name = node?.type?.resolvedName
    const props = node?.props
    if (!name || !props) continue

    if ((props._v ?? 0) < CURRENT_BLOCK_VERSION) {
      tree[nodeId].props = migrateBlockProps(name, props)
      changed = true
    }
  }

  return changed ? JSON.stringify(tree) : craftJson
}
