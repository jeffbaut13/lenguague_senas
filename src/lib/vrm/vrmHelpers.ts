import type { VRM } from "@pixiv/three-vrm";
import { Box3, type Object3D, Vector3 } from "three";
import { VRM_HUMANOID_BONE_CANDIDATES } from "@/lib/vrm/boneMap";
import type { ControlledBone } from "@/types/avatar";

const TMP_SIZE = new Vector3();
const TMP_CENTER = new Vector3();

export function getHumanoidBoneNode(
  vrm: VRM,
  controlledBone: ControlledBone,
): Object3D | null {
  const candidates = VRM_HUMANOID_BONE_CANDIDATES[controlledBone];

  for (const boneName of candidates) {
    const node = vrm.humanoid.getNormalizedBoneNode(boneName as never);
    if (node) {
      return node;
    }
  }

  return null;
}

export function fitAvatarToView(vrm: VRM, targetHeight = 1.55): void {
  const bbox = new Box3().setFromObject(vrm.scene);
  bbox.getSize(TMP_SIZE);

  if (TMP_SIZE.y <= 0.0001) {
    return;
  }

  const scale = targetHeight / TMP_SIZE.y;
  vrm.scene.scale.setScalar(scale);

  const scaledBox = new Box3().setFromObject(vrm.scene);
  scaledBox.getCenter(TMP_CENTER);

  vrm.scene.position.x -= TMP_CENTER.x;
  vrm.scene.position.z -= TMP_CENTER.z;
  vrm.scene.position.y -= scaledBox.min.y;
}

export function disposeVRM(vrm: VRM): void {
  vrm.scene.traverse((obj) => {
    const mesh = obj as unknown as {
      geometry?: { dispose: () => void };
      material?: { dispose: () => void } | { dispose: () => void }[];
    };

    mesh.geometry?.dispose?.();

    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((mat) => mat.dispose?.());
    } else {
      mesh.material?.dispose?.();
    }
  });
}
