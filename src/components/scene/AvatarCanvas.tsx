"use client";

import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { AvatarVRM } from "@/components/avatar/AvatarVRM";
import { SceneEnvironment } from "@/components/scene/SceneEnvironment";
import { SceneLights } from "@/components/scene/SceneLights";

export function AvatarCanvas() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.35, 2.8], fov: 33 }}
      className="h-full w-full"
    >
      <color attach="background" args={["#d7e8f6"]} />
      <SceneLights />
      <SceneEnvironment />
      <AvatarVRM />
      <OrbitControls
        makeDefault
        target={[0, 1.2, 0]}
        minDistance={1.2}
        maxDistance={6}
        maxPolarAngle={Math.PI * 0.5}
        enableDamping
      />
      <Html
        wrapperClass="pointer-events-none"
        position={[0, 2.2, 0]}
        style={{ color: "#465d72", fontSize: "0.85rem" }}
      >
        VRM Preview
      </Html>
    </Canvas>
  );
}
