"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PCFShadowMap } from "three";
import type { Camera, Mesh } from "three";
import type { ArmyBattleActionCue, ArmyBattleFighter, ArmyBattleSimulation } from "@/domain/army-battle";

type FighterState = ArmyBattleFighter & {
  hp: number;
  position: [number, number, number];
};

function getFighterHp(armyBattle: ArmyBattleSimulation, activeTurn: number) {
  const hp = new Map(armyBattle.fighters.map((fighter) => [fighter.id, fighter.maxHp]));

  for (const turn of armyBattle.turns.slice(0, activeTurn + 1)) {
    hp.set(turn.targetId, turn.targetHp);
  }

  return hp;
}

function getPositions(fighters: ArmyBattleFighter[], hp: Map<string, number>) {
  const byTeam = {
    left: fighters.filter((fighter) => fighter.team === "left" && (hp.get(fighter.id) ?? 0) > 0),
    right: fighters.filter((fighter) => fighter.team === "right" && (hp.get(fighter.id) ?? 0) > 0),
  };
  const positions = new Map<string, [number, number, number]>();

  (["left", "right"] as const).forEach((team) => {
    const teamFighters = byTeam[team];
    const side = team === "left" ? -1 : 1;
    const columns = Math.min(3, Math.max(1, Math.ceil(Math.sqrt(teamFighters.length || 1))));

    teamFighters.forEach((fighter, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      positions.set(fighter.id, [
        side * (1.4 + col * 0.95),
        -0.55,
        (row - Math.ceil(teamFighters.length / columns) / 2) * 0.95 + 0.45,
      ]);
    });
  });

  return positions;
}

function geometryForKind(kind: ArmyBattleFighter["kind"]) {
  if (kind === "Mago") return <coneGeometry args={[0.25, 0.7, 6]} />;
  if (kind === "Arquero") return <cylinderGeometry args={[0.16, 0.25, 0.66, 5]} />;
  if (kind === "Caballero" || kind === "Paladin") return <boxGeometry args={[0.44, 0.66, 0.34]} />;
  if (kind === "Esbirro") return <sphereGeometry args={[0.28, 14, 14]} />;
  return <octahedronGeometry args={[0.34]} />;
}

function ArmyFighterMesh({
  fighter,
  active,
  targeted,
  critical,
}: {
  fighter: FighterState;
  active: boolean;
  targeted: boolean;
  critical: boolean;
}) {
  const ref = useRef<Mesh>(null);
  const elapsed = useRef(0);
  const hpRatio = fighter.hp / fighter.maxHp;
  const enemyDirection = fighter.team === "left" ? 1 : -1;

  useFrame((_, delta) => {
    if (!ref.current) return;
    elapsed.current += delta;
    const pulse = Math.sin(elapsed.current * (active ? 9 : 2)) * 0.04;
    ref.current.position.y = pulse;
    ref.current.position.x = active ? enemyDirection * 0.24 : 0;
    ref.current.rotation.y += active ? 0.045 : 0.012;
  });

  return (
    <group position={fighter.position}>
      <mesh ref={ref}>
        {geometryForKind(fighter.kind)}
        <meshStandardMaterial
          color={critical && targeted ? "#ff1f3d" : fighter.color}
          emissive={critical && targeted ? "#ff1f3d" : fighter.color}
          emissiveIntensity={active || targeted ? 0.45 : 0.16}
        />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <boxGeometry args={[0.42, 0.05, 0.04]} />
        <meshStandardMaterial color="#1d2b4f" />
      </mesh>
      <mesh position={[-0.21 + (0.42 * hpRatio) / 2, 0.58, 0.01]}>
        <boxGeometry args={[0.42 * hpRatio, 0.055, 0.045]} />
        <meshStandardMaterial color={hpRatio < 0.35 ? "#ff4f68" : "#59f19a"} emissive={hpRatio < 0.35 ? "#ff4f68" : "#59f19a"} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function Projectile({
  cue,
  from,
  to,
  critical,
}: {
  cue: ArmyBattleActionCue;
  from: [number, number, number];
  to: [number, number, number];
  critical: boolean;
}) {
  const ref = useRef<Mesh>(null);
  const elapsed = useRef(0);
  const color = critical ? "#ff1f3d" : cue === "spell" ? "#4de3ff" : cue === "arrow" ? "#ffe66d" : "#ff7f50";
  const midpoint: [number, number, number] = [
    (from[0] + to[0]) / 2,
    Math.max(from[1], to[1]) + 0.35,
    (from[2] + to[2]) / 2,
  ];

  useFrame((_, delta) => {
    if (!ref.current) return;
    elapsed.current += delta;
    ref.current.rotation.z += cue === "arrow" ? 0.04 : 0.11;
    ref.current.position.y = midpoint[1] + Math.sin(elapsed.current * 8) * 0.08;
  });

  return (
    <mesh ref={ref} position={midpoint}>
      {cue === "arrow" ? <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} /> : <sphereGeometry args={[cue === "spell" ? 0.18 : 0.14, 16, 16]} />}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.85} />
    </mesh>
  );
}

function ServerRoom() {
  return (
    <group>
      <mesh position={[0, -0.92, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9, 6]} />
        <meshStandardMaterial color="#101827" />
      </mesh>
      <gridHelper args={[9, 12, "#59f19a", "#24376b"]} position={[0, -0.9, 0]} />
      {[-4, -3.25, 3.25, 4].map((x) => (
        <mesh key={x} position={[x, 0.1, -1.6]}>
          <boxGeometry args={[0.48, 2.4, 0.38]} />
          <meshStandardMaterial color="#1d2b4f" emissive="#18366e" emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function BattleCamera({
  fighters,
  userControlled,
  onUserControl,
}: {
  fighters: FighterState[];
  userControlled: boolean;
  onUserControl: () => void;
}) {
  const { camera, gl } = useThree();
  const cameraRef = useRef<Camera | null>(null);
  const dragging = useRef(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    cameraRef.current = camera;
    camera.position.set(0, 3.8, 6.8);
    camera.lookAt(0, -0.4, 0);
  }, [camera]);

  useEffect(() => {
    const element = gl.domElement;
    const wheel = (event: WheelEvent) => {
      const activeCamera = cameraRef.current;
      if (!activeCamera) return;
      event.preventDefault();
      onUserControl();
      activeCamera.position.z = Math.max(3.2, Math.min(11, activeCamera.position.z + event.deltaY * 0.008));
      activeCamera.lookAt(0, -0.4, 0);
    };
    const pointerDown = (event: PointerEvent) => {
      dragging.current = true;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      onUserControl();
    };
    const pointerMove = (event: PointerEvent) => {
      const activeCamera = cameraRef.current;
      if (!activeCamera || !dragging.current || !lastPointer.current) return;
      const dx = event.clientX - lastPointer.current.x;
      const dy = event.clientY - lastPointer.current.y;
      activeCamera.position.x -= dx * 0.012;
      activeCamera.position.y += dy * 0.012;
      activeCamera.lookAt(0, -0.4, 0);
      lastPointer.current = { x: event.clientX, y: event.clientY };
    };
    const pointerUp = () => {
      dragging.current = false;
      lastPointer.current = null;
    };

    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerUp);

    return () => {
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
    };
  }, [gl.domElement, onUserControl]);

  useFrame(() => {
    const activeCamera = cameraRef.current;
    if (!activeCamera || userControlled || fighters.length === 0) return;
    const xs = fighters.map((fighter) => fighter.position[0]);
    const zs = fighters.map((fighter) => fighter.position[2]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const spanX = Math.max(4.2, maxX - minX + 2.3);
    const spanZ = Math.max(3.2, maxZ - minZ + 2.4);
    const targetZ = Math.min(10.5, Math.max(5.2, spanX * 1.18 + spanZ * 0.55));
    const targetY = Math.min(6.4, Math.max(3.5, spanZ * 0.82 + 2.3));

    activeCamera.position.x += (centerX - activeCamera.position.x) * 0.06;
    activeCamera.position.y += (targetY - activeCamera.position.y) * 0.06;
    activeCamera.position.z += (targetZ + centerZ * 0.18 - activeCamera.position.z) * 0.06;
    activeCamera.lookAt(centerX, -0.45, centerZ);
  });

  return null;
}

export function ThreeArmyBattleScene({
  armyBattle,
  activeTurn,
}: {
  armyBattle: ArmyBattleSimulation;
  activeTurn: number;
}) {
  const [userControlledCamera, setUserControlledCamera] = useState(false);
  const handleUserControl = useCallback(() => setUserControlledCamera(true), []);
  const hp = useMemo(() => getFighterHp(armyBattle, activeTurn), [armyBattle, activeTurn]);
  const positions = useMemo(() => getPositions(armyBattle.fighters, hp), [armyBattle.fighters, hp]);
  const turn = armyBattle.turns[activeTurn];
  const fighters = armyBattle.fighters
    .map((fighter) => ({
      ...fighter,
      hp: hp.get(fighter.id) ?? fighter.maxHp,
      position: positions.get(fighter.id) ?? [0, -0.55, 0] as [number, number, number],
    }))
    .filter((fighter) => fighter.hp > 0);
  const actor = fighters.find((fighter) => fighter.id === turn?.actorId);
  const target = fighters.find((fighter) => fighter.id === turn?.targetId);

  return (
    <div data-testid="battle-canvas" className="h-[460px] overflow-hidden border-4 border-[#6e83c8] bg-[#09101d] md:h-[620px]">
      <Canvas shadows={{ type: PCFShadowMap }} camera={{ position: [0, 3.4, 6.3], fov: 48 }}>
        <ambientLight intensity={0.62} />
        <pointLight position={[0, 3, 3]} intensity={18} color="#59f19a" />
        <pointLight position={[3, 2, 2]} intensity={10} color="#4de3ff" />
        <ServerRoom />
        {fighters.map((fighter) => (
          <ArmyFighterMesh
            key={fighter.id}
            fighter={fighter}
            active={turn?.actorId === fighter.id}
            targeted={turn?.targetId === fighter.id}
            critical={turn?.critical ?? false}
          />
        ))}
        {turn?.hit && actor && target ? (
          <Projectile cue={turn.actionCue} from={actor.position} to={target.position} critical={turn.critical} />
        ) : null}
        <BattleCamera
          fighters={fighters}
          userControlled={userControlledCamera}
          onUserControl={handleUserControl}
        />
      </Canvas>
    </div>
  );
}
