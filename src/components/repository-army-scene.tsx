"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Camera } from "three";
import type { Mesh } from "three";
import { PCFShadowMap } from "three";
import type { RepositoryCharacter } from "@/domain/repository-characters";

type CameraCommand = "up" | "down" | "left" | "right" | "zoom-in" | "zoom-out";

function CharacterMesh({
  character,
  position,
  onHover,
  onLeave,
}: {
  character: RepositoryCharacter;
  position: [number, number, number];
  onHover: (character: RepositoryCharacter) => void;
  onLeave: () => void;
}) {
  const ref = useRef<Mesh>(null);
  const elapsed = useRef(0);
  const scale = Math.min(2.2, Math.max(0.65, character.power / 55));

  useFrame((_, delta) => {
    if (!ref.current) return;
    elapsed.current += delta;
    ref.current.rotation.y += character.isFork ? 0.008 : 0.015;
    ref.current.position.y = position[1] + Math.sin(elapsed.current * 2 + character.id) * 0.05;
  });

  const geometry =
    character.kind === "Mago" ? (
      <coneGeometry args={[0.55, 1.45, 6]} />
    ) : character.kind === "Caballero" || character.kind === "Paladin" ? (
      <boxGeometry args={[0.9, 1.25, 0.65]} />
    ) : character.kind === "Arquero" ? (
      <cylinderGeometry args={[0.35, 0.55, 1.25, 5]} />
    ) : character.kind === "Esbirro" ? (
      <sphereGeometry args={[0.48, 16, 16]} />
    ) : (
      <octahedronGeometry args={[0.72]} />
    );

  return (
    <group
      position={position}
      scale={[scale, scale, scale]}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover(character);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        onLeave();
      }}
    >
      <mesh ref={ref} castShadow>
        {geometry}
        <meshStandardMaterial color={character.color} emissive={character.color} emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color={character.isFork ? "#9aa8c7" : "#ffe66d"} emissive="#ffe66d" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function Battlefield({
  characters,
  onHoverCharacter,
  onLeaveCharacter,
}: {
  characters: RepositoryCharacter[];
  onHoverCharacter: (character: RepositoryCharacter) => void;
  onLeaveCharacter: () => void;
}) {
  const positions = useMemo(() => {
    const columns = Math.ceil(Math.sqrt(characters.length || 1));
    return characters.map((_, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      return [
        (col - (columns - 1) / 2) * 2.6,
        0,
        (row - (Math.ceil(characters.length / columns) - 1) / 2) * 2.2,
      ] as [number, number, number];
    });
  }, [characters]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]} receiveShadow>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color="#101827" />
      </mesh>
      <gridHelper args={[24, 24, "#59f19a", "#24376b"]} position={[0, -0.72, 0]} />
      {characters.map((character, index) => (
        <CharacterMesh
          key={character.id}
          character={character}
          position={positions[index]}
          onHover={onHoverCharacter}
          onLeave={onLeaveCharacter}
        />
      ))}
    </group>
  );
}

function CameraControls({ command }: { command: CameraCommand | null }) {
  const { camera, gl } = useThree();
  const cameraRef = useRef<Camera | null>(null);
  const keys = useRef(new Set<string>());

  useEffect(() => {
    cameraRef.current = camera;
    cameraRef.current.position.set(0, 7, 10);
    cameraRef.current.lookAt(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => keys.current.add(event.key.toLowerCase());
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    const wheel = (event: WheelEvent) => {
      const activeCamera = cameraRef.current;
      if (!activeCamera) return;
      event.preventDefault();
      activeCamera.position.z = Math.max(4, Math.min(18, activeCamera.position.z + event.deltaY * 0.01));
      activeCamera.lookAt(0, 0, 0);
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    gl.domElement.addEventListener("wheel", wheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      gl.domElement.removeEventListener("wheel", wheel);
    };
  }, [gl.domElement]);

  useEffect(() => {
    const activeCamera = cameraRef.current;
    if (!activeCamera) return;
    if (!command) return;
    if (command === "left") activeCamera.position.x -= 0.8;
    if (command === "right") activeCamera.position.x += 0.8;
    if (command === "up") activeCamera.position.z -= 0.8;
    if (command === "down") activeCamera.position.z += 0.8;
    if (command === "zoom-in") activeCamera.position.y = Math.max(3.2, activeCamera.position.y - 0.8);
    if (command === "zoom-out") activeCamera.position.y = Math.min(13, activeCamera.position.y + 0.8);
    activeCamera.lookAt(0, 0, 0);
  }, [command]);

  useFrame(() => {
    const activeCamera = cameraRef.current;
    if (!activeCamera) return;
    const speed = 0.08;
    const active = keys.current;
    if (active.has("a") || active.has("arrowleft")) activeCamera.position.x -= speed;
    if (active.has("d") || active.has("arrowright")) activeCamera.position.x += speed;
    if (active.has("w") || active.has("arrowup")) activeCamera.position.z -= speed;
    if (active.has("s") || active.has("arrowdown")) activeCamera.position.z += speed;
    activeCamera.lookAt(0, 0, 0);
  });

  return null;
}

export function RepositoryArmyScene({ characters }: { characters: RepositoryCharacter[] }) {
  const [command, setCommand] = useState<CameraCommand | null>(null);
  const [hoveredCharacter, setHoveredCharacter] = useState<RepositoryCharacter | null>(null);

  function runCommand(nextCommand: CameraCommand) {
    setCommand(nextCommand);
    window.setTimeout(() => setCommand(null), 0);
  }

  return (
    <div className="grid gap-3">
      <div className="relative h-[420px] overflow-hidden border-4 border-[#6e83c8] bg-[#09101d] md:h-[560px]">
        <Canvas shadows={{ type: PCFShadowMap }} camera={{ position: [0, 7, 10], fov: 50 }}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 10, 6]} intensity={2.2} castShadow />
          <pointLight position={[0, 4, 0]} intensity={20} color="#59f19a" />
          <Battlefield
            characters={characters}
            onHoverCharacter={setHoveredCharacter}
            onLeaveCharacter={() => setHoveredCharacter(null)}
          />
          <CameraControls command={command} />
        </Canvas>
        {hoveredCharacter ? (
          <div className="pointer-events-none absolute left-3 top-3 max-w-[min(320px,calc(100%-24px))] border-2 border-[#a7ffc6] bg-[#09101d]/95 p-3 shadow-[4px_4px_0_#1e2b52]">
            <p className="font-mono text-sm font-black uppercase text-[#eef3ff]">{hoveredCharacter.name}</p>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs text-[#b9c8ef]">
              <span className="text-[#ffe66d]">Origen</span>
              <span>{hoveredCharacter.isFork ? "Fork" : "Source"}</span>
              <span className="text-[#ffe66d]">Tipo</span>
              <span>{hoveredCharacter.kind}</span>
              <span className="text-[#ffe66d]">Poder</span>
              <span>{hoveredCharacter.power}</span>
              <span className="text-[#ffe66d]">Lenguaje</span>
              <span>{hoveredCharacter.language}</span>
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border border-[#40558f] bg-[#0e1629] p-3">
        <p className="font-mono text-xs uppercase text-[#b9c8ef]">
          Explorar: WASD / flechas. Zoom: rueda del mouse o botones.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            ["left", "←"],
            ["up", "↑"],
            ["down", "↓"],
            ["right", "→"],
            ["zoom-in", "+"],
            ["zoom-out", "-"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => runCommand(value as CameraCommand)}
              className="grid size-9 place-items-center border border-[#8fa5ff] bg-[#1e2b52] font-mono text-sm font-bold text-[#eff4ff]"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
