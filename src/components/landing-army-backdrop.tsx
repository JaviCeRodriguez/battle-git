"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";
import { PCFShadowMap } from "three";
import type { RepositoryCharacter } from "@/domain/repository-characters";

function ArmyUnit({
  character,
  position,
}: {
  character: RepositoryCharacter;
  position: [number, number, number];
}) {
  const meshRef = useRef<Mesh>(null);
  const pulseRef = useRef(0);
  const scale = Math.min(1.9, Math.max(0.55, character.power / 80));

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    pulseRef.current += delta;
    meshRef.current.rotation.y += character.isFork ? 0.004 : 0.01;
    meshRef.current.position.y = position[1] + Math.sin(pulseRef.current * 1.8 + character.id) * 0.045;
  });

  const geometry =
    character.kind === "Mago" ? (
      <coneGeometry args={[0.5, 1.35, 6]} />
    ) : character.kind === "Caballero" || character.kind === "Paladin" ? (
      <boxGeometry args={[0.85, 1.18, 0.6]} />
    ) : character.kind === "Arquero" ? (
      <cylinderGeometry args={[0.32, 0.52, 1.2, 5]} />
    ) : character.kind === "Esbirro" ? (
      <sphereGeometry args={[0.46, 14, 14]} />
    ) : (
      <octahedronGeometry args={[0.68]} />
    );

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh ref={meshRef} castShadow>
        {geometry}
        <meshStandardMaterial
          color={character.color}
          emissive={character.color}
          emissiveIntensity={0.25}
          roughness={0.55}
        />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial
          color={character.isFork ? "#c3cce0" : "#ffe66d"}
          emissive={character.isFork ? "#9aa8c7" : "#ffe66d"}
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  );
}

function LandingBattlefield({ characters }: { characters: RepositoryCharacter[] }) {
  const visibleCharacters = useMemo(() => characters.slice(0, 18), [characters]);
  const positions = useMemo(() => {
    const columns = Math.max(3, Math.ceil(Math.sqrt(visibleCharacters.length || 1)));

    return visibleCharacters.map((_, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;

      return [
        (col - (columns - 1) / 2) * 2.25,
        0,
        (row - 1.25) * 1.95,
      ] as [number, number, number];
    });
  }, [visibleCharacters]);

  return (
    <group rotation={[0, -0.22, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 0]} receiveShadow>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color="#08101e" />
      </mesh>
      <gridHelper args={[24, 24, "#59f19a", "#2f457f"]} position={[0, -0.7, 0]} />
      <mesh position={[0, 2.5, -5.5]}>
        <boxGeometry args={[16, 4.8, 0.2]} />
        <meshStandardMaterial color="#111a31" emissive="#1e2b52" emissiveIntensity={0.35} />
      </mesh>
      {visibleCharacters.map((character, index) => (
        <ArmyUnit key={character.id} character={character} position={positions[index]} />
      ))}
    </group>
  );
}

export function LandingArmyBackdrop({ characters }: { characters: RepositoryCharacter[] }) {
  return (
    <div className="absolute inset-0 opacity-85">
      <Canvas
        shadows={{ type: PCFShadowMap }}
        camera={{ position: [2.8, 7.4, 11.5], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 9, 6]} intensity={2.5} castShadow />
        <pointLight position={[-3, 3, 2]} intensity={35} color="#4de3ff" />
        <pointLight position={[4, 2.5, -2]} intensity={26} color="#59f19a" />
        <LandingBattlefield characters={characters} />
      </Canvas>
    </div>
  );
}
