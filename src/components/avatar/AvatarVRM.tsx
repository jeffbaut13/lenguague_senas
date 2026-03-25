"use client";

import { useEffect, useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { VRM } from "@pixiv/three-vrm";
import { applyBonePose } from "@/lib/animation/applyBonePose";
import { primeAvatarBindPose } from "@/lib/animation/applyBonePose";
import { applyExpressionState } from "@/lib/animation/applyExpressionState";
import { loadVRM } from "@/lib/vrm/loadVRM";
import { disposeVRM, fitAvatarToView } from "@/lib/vrm/vrmHelpers";
import { createDefaultBonePose } from "@/mocks/avatarPose.mock";
import { useAvatarStore } from "@/store/avatarStore";
import { debugLog, debugWarn } from "@/utils/debug";

const AVATAR_URL = "/avatars/avatar.vrm";
const FRONT_FACING_Y_ROTATION = Math.PI;

export function AvatarVRM() {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setAvatarLoaded = useAvatarStore((state) => state.setAvatarLoaded);
  const currentBonePose = useAvatarStore((state) => state.currentBonePose);
  const currentExpressions = useAvatarStore(
    (state) => state.currentExpressions,
  );

  const stateSnapshot = useMemo(
    () => ({ currentBonePose, currentExpressions }),
    [currentBonePose, currentExpressions],
  );

  useEffect(() => {
    let mounted = true;
    let loadedVrm: VRM | null = null;

    setAvatarLoaded(false);

    const setup = async () => {
      try {
        loadedVrm = await loadVRM(AVATAR_URL);
        if (!mounted || !loadedVrm) {
          return;
        }

        fitAvatarToView(loadedVrm);
        primeAvatarBindPose(loadedVrm, createDefaultBonePose());
        loadedVrm.scene.rotation.y = FRONT_FACING_Y_ROTATION;
        setVrm(loadedVrm);
        setAvatarLoaded(true);
        debugLog("Avatar VRM cargado", AVATAR_URL);
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "Error desconocido";
        setError(message);
        setAvatarLoaded(false);
        debugWarn("No se pudo cargar avatar VRM", cause);
      }
    };

    void setup();

    return () => {
      mounted = false;
      setAvatarLoaded(false);
      if (loadedVrm) {
        disposeVRM(loadedVrm);
      }
    };
  }, [setAvatarLoaded]);

  useFrame((_, delta) => {
    if (!vrm) {
      return;
    }

    applyBonePose(vrm, stateSnapshot.currentBonePose);
    applyExpressionState(vrm, stateSnapshot.currentExpressions);
    vrm.update(delta);
  });

  if (error) {
    return (
      <Html center>
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          Error cargando avatar: {error}
        </div>
      </Html>
    );
  }

  if (!vrm) {
    return (
      <Html center>
        <div className="rounded-md border border-slate-200 bg-white/95 px-3 py-2 text-sm text-slate-700 shadow-sm">
          Cargando /public/avatars/avatar.vrm ...
        </div>
      </Html>
    );
  }

  return <primitive object={vrm.scene} />;
}
