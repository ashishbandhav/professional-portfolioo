import { useEffect, useRef } from "react";
import * as THREE from "three";

const SolarSystem = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 50, 100);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 5000;
    const starsPositions = new Float32Array(starsCount * 3);
    const starsColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      starsPositions[i] = (Math.random() - 0.5) * 400;
      starsPositions[i + 1] = (Math.random() - 0.5) * 400;
      starsPositions[i + 2] = (Math.random() - 0.5) * 400;

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.6, 0.5, 0.8 + Math.random() * 0.2);
      starsColors[i] = color.r;
      starsColors[i + 1] = color.g;
      starsColors[i + 2] = color.b;
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starsPositions, 3)
    );
    starsGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(starsColors, 3)
    );
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(8, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffdd44,
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Sun glow
    const glowGeometry = new THREE.SphereGeometry(10, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.3,
    });
    const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(sunGlow);

    // Planets data
    const planetData = [
      { radius: 1, distance: 15, speed: 0.02, color: 0x888888 },
      { radius: 1.5, distance: 22, speed: 0.015, color: 0xffaa66 },
      { radius: 2, distance: 30, speed: 0.01, color: 0x44aaff },
      { radius: 1.8, distance: 38, speed: 0.008, color: 0xff4444 },
      { radius: 5, distance: 50, speed: 0.004, color: 0xffaa44 },
      { radius: 4.5, distance: 65, speed: 0.003, color: 0xffcc99 },
      { radius: 3.5, distance: 78, speed: 0.002, color: 0x99ddff },
      { radius: 3.2, distance: 90, speed: 0.0015, color: 0x6688ff },
    ];

    const planets: { mesh: THREE.Mesh; speed: number; distance: number }[] = [];

    planetData.forEach((data) => {
      // Orbit path
      const orbitGeometry = new THREE.RingGeometry(
        data.distance - 0.1,
        data.distance + 0.1,
        64
      );
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x444444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3,
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);

      // Planet
      const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
      const material = new THREE.MeshLambertMaterial({
        color: data.color,
      });
      const planet = new THREE.Mesh(geometry, material);
      planet.position.x = data.distance;
      scene.add(planet);

      planets.push({
        mesh: planet,
        speed: data.speed,
        distance: data.distance,
      });
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2, 200);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.005;

      // Rotate sun and glow
      sun.rotation.y += 0.002;
      sunGlow.rotation.y += 0.002;

      // Orbit planets
      planets.forEach((planet) => {
        const angle = time * planet.speed;
        planet.mesh.position.x = Math.cos(angle) * planet.distance;
        planet.mesh.position.z = Math.sin(angle) * planet.distance;
        planet.mesh.rotation.y += 0.01;
      });

      // Rotate stars
      stars.rotation.y += 0.0001;

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        backgroundColor: "#000011",
      }}
    />
  );
};

export default SolarSystem;
