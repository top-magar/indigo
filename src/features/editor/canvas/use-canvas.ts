import React, { useState, useEffect, useRef, useCallback } from "react";

export type CanvasTransform = { x: number; y: number; z: number };

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const ZOOM_SPEED = 0.002;

export function useCanvas() {
  const [canvasEl, setCanvasEl] = useState<HTMLDivElement | null>(null);
  const canvasRefObj = useRef<HTMLDivElement | null>(null);
  const canvasRef = useCallback((node: HTMLDivElement | null) => { canvasRefObj.current = node; setCanvasEl(node); }, []);
  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, z: 1 });
  const [panning, setPanning] = useState(false);
  const [altHeld, setAltHeld] = useState(false);
  const spaceRef = useRef(false);
  const tRef = useRef(transform);
  tRef.current = transform;

  // ── Zoom to cursor (pinch + Cmd+scroll) + free scroll ──
  useEffect(() => {
    const el = canvasEl;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const t = tRef.current;
        const factor = Math.exp(-e.deltaY * ZOOM_SPEED);
        const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, t.z * factor));
        const nx = cx - (cx - t.x) * (nz / t.z);
        const ny = cy - (cy - t.y) * (nz / t.z);
        setTransform({ x: nx, y: ny, z: nz });
        return;
      }
      e.preventDefault();
      const t = tRef.current;
      setTransform({ x: t.x - e.deltaX, y: t.y - e.deltaY, z: t.z });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [canvasEl]);

  // ── Space/Alt key tracking ──
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target as HTMLElement).matches("input,textarea,[contenteditable]")) { e.preventDefault(); spaceRef.current = true; setPanning(true); }
      if (e.key === "Alt") setAltHeld(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "Space") { spaceRef.current = false; setPanning(false); }
      if (e.key === "Alt") setAltHeld(false);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, []);

  // ── Space+drag / middle-click pan ──
  const onCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    const shouldPan = spaceRef.current || e.button === 1;
    if (!shouldPan) return;
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    const st = tRef.current;
    const onMove = (ev: PointerEvent) => {
      setTransform({ x: st.x + (ev.clientX - sx), y: st.y + (ev.clientY - sy), z: st.z });
    };
    const onUp = () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", onUp); };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, []);

  // ── Zoom helpers ──
  const zoomTo = useCallback((newZ: number) => {
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const t = tRef.current;
    const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZ));
    setTransform({ x: cx - (cx - t.x) * (nz / t.z), y: cy - (cy - t.y) * (nz / t.z), z: nz });
  }, [canvasEl]);

  const zoomIn = useCallback(() => zoomTo(tRef.current.z * 1.2), [zoomTo]);
  const zoomOut = useCallback(() => zoomTo(tRef.current.z / 1.2), [zoomTo]);
  const zoomReset = useCallback(() => {
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const canvas = canvasEl.querySelector("[data-canvas]");
    const cw = canvas ? canvas.scrollWidth : 800;
    setTransform({ x: (rect.width - cw) / 2, y: 40, z: 1 });
  }, [canvasEl]);

  const zoomToFit = useCallback((contentWidth: number, contentHeight: number) => {
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const pad = 60;
    const nz = Math.min((rect.width - pad * 2) / contentWidth, (rect.height - pad * 2) / contentHeight, MAX_ZOOM);
    setTransform({ x: (rect.width - contentWidth * nz) / 2, y: pad, z: nz });
  }, [canvasEl]);

  const zoomToRect = useCallback((elRect: { x: number; y: number; w: number; h: number }) => {
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const pad = 80;
    const nz = Math.min((rect.width - pad * 2) / elRect.w, (rect.height - pad * 2) / elRect.h, MAX_ZOOM);
    setTransform({
      x: (rect.width - elRect.w * nz) / 2 - elRect.x * nz,
      y: (rect.height - elRect.h * nz) / 2 - elRect.y * nz,
      z: nz,
    });
  }, [canvasEl]);

  const transformCSS = `translate(${transform.x}px, ${transform.y}px) scale(${transform.z})`;
  const cursor = panning ? "cursor-grab active:cursor-grabbing" : altHeld ? "cursor-copy" : "";

  const zoom = Math.round(transform.z * 100);
  const setZoom: React.Dispatch<React.SetStateAction<number>> = useCallback((action) => {
    const current = Math.round(tRef.current.z * 100);
    const newPct = typeof action === "function" ? action(current) : action;
    zoomTo(newPct / 100);
  }, [zoomTo]);

  return {
    canvasRef, canvasRefObj, transform, setTransform, transformCSS,
    zoom, setZoom, zoomIn, zoomOut, zoomReset, zoomToFit, zoomToRect,
    panning, altHeld, spaceRef, onCanvasPointerDown, cursor,
  };
}
