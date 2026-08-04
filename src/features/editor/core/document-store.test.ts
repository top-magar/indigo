import { beforeEach, describe, expect, it } from "vitest";
import type { El } from "./types";
import { useDocumentStore } from "./document-store";
import { findEl } from "./tree-helpers";

function createDocument(): El[] {
  return [
    {
      id: "__body",
      type: "__body",
      name: "Body",
      styles: { width: "100%" },
      content: [
        {
          id: "box",
          type: "container",
          name: "Box",
          styles: { width: "100px", paddingTop: "12px" },
          content: [],
        },
      ],
    },
  ];
}

function getBox() {
  const box = findEl(useDocumentStore.getState().elements, "box");
  if (!box) throw new Error("Expected box element");
  return box;
}

describe("editor document store history", () => {
  beforeEach(() => {
    useDocumentStore.getState().loadData(createDocument());
  });

  it("keeps no-op commits from marking a clean document dirty", () => {
    useDocumentStore.getState().commitHistory();

    const state = useDocumentStore.getState();
    expect(state.dirty).toBe(false);
    expect(state.patches).toHaveLength(0);
    expect(state.currentIndex).toBe(0);
  });

  it("commits live style updates as one undoable history entry", () => {
    useDocumentStore.getState().updateElementLive({
      ...getBox(),
      styles: { ...getBox().styles, width: "144px" },
    });

    expect(useDocumentStore.getState().patches).toHaveLength(0);
    expect(getBox().styles.width).toBe("144px");

    useDocumentStore.getState().commitHistory();

    expect(useDocumentStore.getState().patches).toHaveLength(1);
    expect(useDocumentStore.getState().currentIndex).toBe(1);

    useDocumentStore.getState().undo();
    expect(getBox().styles.width).toBe("100px");

    useDocumentStore.getState().redo();
    expect(getBox().styles.width).toBe("144px");
  });

  it("collapses multiple live updates into a single before and after patch", () => {
    useDocumentStore.getState().updateElementLive({
      ...getBox(),
      styles: { ...getBox().styles, width: "120px" },
    });
    useDocumentStore.getState().updateElementLive({
      ...getBox(),
      styles: { ...getBox().styles, width: "160px", paddingTop: "24px" },
    });
    useDocumentStore.getState().commitHistory();

    expect(useDocumentStore.getState().patches).toHaveLength(1);

    useDocumentStore.getState().undo();
    expect(getBox().styles.width).toBe("100px");
    expect(getBox().styles.paddingTop).toBe("12px");

    useDocumentStore.getState().redo();
    expect(getBox().styles.width).toBe("160px");
    expect(getBox().styles.paddingTop).toBe("24px");
  });

  it("acknowledges only the revision captured by an in-flight save", () => {
    useDocumentStore.getState().updateElement({
      ...getBox(),
      styles: { ...getBox().styles, width: "120px" },
    });
    const capturedRevision = useDocumentStore.getState().localRevision;

    useDocumentStore.getState().updateElement({
      ...getBox(),
      styles: { ...getBox().styles, width: "160px" },
    });
    useDocumentStore.getState().acknowledgeSave(capturedRevision, 4);

    const pending = useDocumentStore.getState();
    expect(pending.serverRevision).toBe(4);
    expect(pending.acknowledgedLocalRevision).toBe(capturedRevision);
    expect(pending.localRevision).toBeGreaterThan(capturedRevision);
    expect(pending.dirty).toBe(true);
    expect(pending.saveStatus).toBe("unsaved");

    pending.acknowledgeSave(pending.localRevision, 5);
    expect(useDocumentStore.getState().dirty).toBe(false);
    expect(useDocumentStore.getState().saveStatus).toBe("saved");
  });
});
