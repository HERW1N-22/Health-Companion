import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { MathUtils } from "three";

function Sculpture({ active, reduced, color }) {
  const group = useRef();
  const breathStart = useRef(null);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => {
      if (!document.hidden) invalidate();
    }, 1000 / 30);
    return () => clearInterval(timer);
  }, [reduced, invalidate]);
  useFrame(({ clock, pointer }, delta) => {
    if (!group.current || reduced) return;
    const t = clock.elapsedTime;
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      pointer.x * 0.32 + 0.2,
      3,
      delta,
    );
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      -pointer.y * 0.22 + 0.2,
      3,
      delta,
    );
    group.current.rotation.z = Math.sin(t * 0.18) * 0.08;
    if (active && breathStart.current === null) breathStart.current = t;
    if (!active) breathStart.current = null;
    const phase = active ? t - breathStart.current : 0;
    const scale = active ? 1 + (1 - Math.cos((phase * Math.PI) / 4)) * 0.04 : 1;
    group.current.scale.setScalar(scale);
    group.current.position.y = Math.sin(t * 0.7) * 0.06;
  });
  return (
    <group ref={group} rotation={[0.2, 0.2, -0.1]}>
      <mesh rotation={[0.9, -0.4, 0.1]}>
        <torusGeometry args={[1.12, 0.32, 24, 96]} />
        <meshStandardMaterial color={color} roughness={0.26} metalness={0.25} />
      </mesh>
      <mesh rotation={[-0.65, 0.9, 0.25]}>
        <torusGeometry args={[1.12, 0.32, 24, 96]} />
        <meshStandardMaterial color="#c8e4b4" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.61, 32, 32]} />
        <meshStandardMaterial
          color="#fbf5ce"
          roughness={0.23}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[1.65, 0.85, 0.3]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color="#416b48" roughness={0.25} />
      </mesh>
      <mesh position={[-1.6, -0.75, 0.4]}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshStandardMaterial color="#d4ae63" />
      </mesh>
    </group>
  );
}
export default function WellnessScene({ active, color = "#527e60" }) {
  const reduced = useReducedMotion();
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop="demand"
      camera={{ position: [0, 0, 5.8], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      aria-label="Interactive interlocking wellness sculpture"
    >
      <ambientLight intensity={1.6} />
      <directionalLight position={[3, 5, 4]} intensity={3} />
      <directionalLight position={[-4, 0, 2]} intensity={1.2} color="#e7f9de" />
      <Sculpture active={active} reduced={reduced} color={color} />
    </Canvas>
  );
}
