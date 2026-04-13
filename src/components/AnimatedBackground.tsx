import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0xfaf8f3, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 50;

    const spheres: THREE.Mesh[] = [];
    const geometry = new THREE.IcosahedronGeometry(2, 4);

    for (let i = 0; i < 5; i++) {
      const material = new THREE.MeshPhongMaterial({
        color: i % 2 === 0 ? 0x2563eb : 0x10b981,
        emissive: i % 2 === 0 ? 0x2563eb : 0x10b981,
        emissiveIntensity: 0.2,
        wireframe: false,
        flatShading: true,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 50
      );
      sphere.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      spheres.push(sphere);
      scene.add(sphere);
    }

    const light = new THREE.PointLight(0x2563eb, 1, 500);
    light.position.set(50, 50, 50);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      spheres.forEach((sphere, i) => {
        sphere.rotation.x += 0.001 * (i + 1);
        sphere.rotation.y += 0.0015 * (i + 1);
      });
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 opacity-40" />;
}
