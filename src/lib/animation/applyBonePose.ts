import { Euler, Quaternion } from "three";
import type { VRM } from "@pixiv/three-vrm";
import type { BonePoseMap, ControlledBone } from "@/types/avatar";
import { clampBonePoseMap } from "@/lib/animation/boneLimits";
import { getHumanoidBoneNode } from "@/lib/vrm/vrmHelpers";

const TMP_EULER = new Euler(0, 0, 0, "XYZ");
const TMP_DELTA_QUATERNION = new Quaternion();
const BIND_POSE_CACHE = new WeakMap<VRM, Partial<Record<ControlledBone, Quaternion>>>();

function getCachedBindPose(
  vrm: VRM,
  bone: ControlledBone,
): Quaternion | null {
  const existingCache = BIND_POSE_CACHE.get(vrm);
  if (existingCache?.[bone]) {
    return existingCache[bone] ?? null;
  }

  const node = getHumanoidBoneNode(vrm, bone);
  if (!node) {
    return null;
  }

  const nextCache = existingCache ?? {};
  nextCache[bone] = node.quaternion.clone();
  BIND_POSE_CACHE.set(vrm, nextCache);
  return nextCache[bone] ?? null;
}

export function primeAvatarBindPose(vrm: VRM, pose: BonePoseMap): void {
  for (const boneName of Object.keys(pose) as ControlledBone[]) {
    getCachedBindPose(vrm, boneName);
  }
}

export function applyBonePose(vrm: VRM, pose: BonePoseMap): void {
  const clampedPose = clampBonePoseMap(pose);

  for (const boneName of Object.keys(clampedPose) as ControlledBone[]) {
    const transform = clampedPose[boneName];
    if (!transform) {
      continue;
    }

    const node = getHumanoidBoneNode(vrm, boneName);
    if (!node) {
      continue;
    }

    const bindPose = getCachedBindPose(vrm, boneName);
    if (!bindPose) {
      continue;
    }

    TMP_EULER.set(
      transform.rotation.x,
      transform.rotation.y,
      transform.rotation.z,
      "XYZ",
    );

    TMP_DELTA_QUATERNION.setFromEuler(TMP_EULER);
    node.quaternion.copy(bindPose).multiply(TMP_DELTA_QUATERNION);
  }
}
