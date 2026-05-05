"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Dot-matrix grid
    const cols = 40;
    const rows = 40;
    const spacing = 1.2;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(cols * rows * 3);
    const sizes = new Float32Array(cols * rows);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const idx = (i * rows + j) * 3;
        positions[idx] = (i - cols / 2) * spacing;
        positions[idx + 1] = (j - rows / 2) * spacing;
        positions[idx + 2] = (Math.random() - 0.5) * 4;
        sizes[i * rows + j] = Math.random() * 0.5 + 0.3;
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      color: 0x22c55e,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Pointer tracking
    const mouse = { x: 0, y: 0 };
    const handlePointer = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    container.addEventListener("pointermove", handlePointer);

    // Animation: slow breathing pulse + pointer drift
    let frame = 0;
    let animId: number;
    const animate = () => {
      frame++;
      const time = frame * 0.005;

      // Breathing pulse
      const pulse = Math.sin(time) * 0.1 + 1;
      points.scale.set(pulse, pulse, 1);

      // Pointer-reactive drift
      points.rotation.x += (mouse.y * 0.05 - points.rotation.x) * 0.02;
      points.rotation.y += (mouse.x * 0.05 - points.rotation.y) * 0.02;

      // Slow orbital drift
      points.rotation.z = time * 0.05;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointermove", handlePointer);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ touchAction: "none" }}
      aria-hidden="true"
    />
  );
}
