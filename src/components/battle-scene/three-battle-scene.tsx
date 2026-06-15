"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import type { BattleSimulation } from "@/domain/types";

function PlaceholderFighter({
  color,
  accent,
  position,
  active,
}: {
  color: string;
  accent: string;
  position: [number, number, number];
  active: boolean;
}) {
  const ref = useRef<Mesh>(null);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    elapsed.current += delta;
    const pulse = Math.sin(elapsed.current * (active ? 8 : 2)) * 0.08;
    ref.current.position.y = position[1] + pulse;
    ref.current.rotation.y += active ? 0.03 : 0.01;
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <boxGeometry args={[0.9, 1.25, 0.55]} />
        <meshStandardMaterial color={color} emissive={active ? accent : "#111827"} emissiveIntensity={active ? 0.45 : 0.08} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.38, 18, 18]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function ServerRoom() {
  const racks = useMemo(() => [-3.6, -2.4, 2.4, 3.6], []);

  return (
    <group>
      <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 5]} />
        <meshStandardMaterial color="#101827" />
      </mesh>
      {racks.map((x) => (
        <mesh key={x} position={[x, 0.1, -1.2]}>
          <boxGeometry args={[0.55, 2.7, 0.45]} />
          <meshStandardMaterial color="#1d2b4f" emissive="#18366e" emissiveIntensity={0.15} />
        </mesh>
      ))}
      <mesh position={[0, 0.1, -1.55]}>
        <boxGeometry args={[2.4, 1.25, 0.18]} />
        <meshStandardMaterial color="#0b1020" emissive="#47e1ff" emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

export function ThreeBattleScene({
  battle,
  activeTurn,
}: {
  battle: BattleSimulation;
  activeTurn: number;
}) {
  const [left, right] = battle.participants;
  const turn = battle.turns[activeTurn];

  return (
    <div data-testid="battle-canvas" className="h-[320px] overflow-hidden border-4 border-[#6e83c8] bg-[#09101d] md:h-[420px]">
      <Canvas camera={{ position: [0, 1.2, 6], fov: 48 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 3, 3]} intensity={16} color="#59f19a" />
        <pointLight position={[3, 2, 2]} intensity={10} color="#4de3ff" />
        <ServerRoom />
        <PlaceholderFighter
          color={left.visualPreset.primaryColor}
          accent={left.visualPreset.secondaryColor}
          position={[-1.55, -0.25, 0]}
          active={turn?.actorId === left.id}
        />
        <PlaceholderFighter
          color={right.visualPreset.primaryColor}
          accent={right.visualPreset.secondaryColor}
          position={[1.55, -0.25, 0]}
          active={turn?.actorId === right.id}
        />
      </Canvas>
    </div>
  );
}
