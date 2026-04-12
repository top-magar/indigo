import type { Instance, InstanceId } from "../types"
import { getMeta } from "./registry"

/** Check if parentComponent can accept childComponent as a direct child. */
export function canAcceptChild(parentComponent: string, childComponent: string): boolean {
  const parentMeta = getMeta(parentComponent)
  if (!parentMeta) return false

  const childMeta = getMeta(childComponent)
  if (!childMeta) return false

  const { children } = parentMeta.contentModel
  if (children.length === 0) return false

  // Check if parent accepts child's category or the specific component name
  return children.includes(childMeta.contentModel.category) || children.includes(childComponent)
}

export interface ValidationError {
  instanceId: InstanceId
  parentId: InstanceId
  message: string
}

/** Walk the full instance tree and report all content model violations. */
export function validateTree(instances: Map<InstanceId, Instance>): ValidationError[] {
  const errors: ValidationError[] = []

  for (const [parentId, parent] of instances) {
    for (const child of parent.children) {
      if (child.type !== "id") continue
      const childInst = instances.get(child.value)
      if (!childInst) continue

      if (!canAcceptChild(parent.component, childInst.component)) {
        const parentMeta = getMeta(parent.component)
        const childMeta = getMeta(childInst.component)
        errors.push({
          instanceId: child.value,
          parentId,
          message: `"${childMeta?.label ?? childInst.component}" cannot be a child of "${parentMeta?.label ?? parent.component}"`,
        })
      }
    }
  }

  return errors
}
