"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function InsetWebGL() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Icosahedron with MeshStandardMaterial
    const geometry = new THREE.IcosahedronGeometry(1.4, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffd600,
      metalness: 0.3,
      roughness: 0.6,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Dot-matrix particle field behind
    const dotCount = 800;
    const dotGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
    }
    dotGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const dotMat = new THREE.PointsMaterial({ color: 0x22c55e, size: 0.03, transparent: true, opacity: 0.5 });
    const dots = new THREE.Points(dotGeo, dotMat);
    scene.add(dots);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(3, 3, 5);
    scene.add(directional);

    // Pointer
    const mouse = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    container.addEventListener("pointermove", onPointer);

    // Animate: slow orbital drift + breathing
    let animId: number;
    const animate = () => {
      const t = performance.now() * 0.0005;

      // Orbital drift
      mesh.rotation.x = t * 0.3 + mouse.y * 0.1;
      mesh.rotation.y = t * 0.5 + mouse.x * 0.1;

      // Breathing pulse
      const scale = 1 + Math.sin(t * 2) * 0.05;
      mesh.scale.setScalar(scale);

      // Dots slow rotation
      dots.rotation.y = t * 0.1;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("pointermove", onPointer);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      dotGeo.dispose();
      dotMat.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-auto" style={{ touchAction: "none" }} aria-hidden="true" />
  );
}
