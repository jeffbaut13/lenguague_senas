import { clamp } from "@/utils/clamp";
import type { BoneAxis, BonePoseMap, ControlledBone, EulerRotation } from "@/types/avatar";

type AxisLimit = {
  min: number;
  max: number;
};

type BoneLimitMap = Record<BoneAxis, AxisLimit>;

const DEFAULT_LIMITS: BoneLimitMap = {
  x: { min: -Math.PI, max: Math.PI },
  y: { min: -Math.PI, max: Math.PI },
  z: { min: -Math.PI, max: Math.PI },
};

const FINGER_LIMITS: BoneLimitMap = {
  x: { min: -1.6, max: 1.6 },
  y: { min: -0.7, max: 0.7 },
  z: { min: -0.7, max: 0.7 },
};

export const SAFE_BONE_LIMITS: Partial<Record<ControlledBone, BoneLimitMap>> = {
  head: {
    x: { min: -0.9, max: 0.9 },
    y: { min: -1.2, max: 1.2 },
    z: { min: -0.6, max: 0.6 },
  },
  neck: {
    x: { min: -0.52, max: 0.52 },
    y: { min: -0.9, max: 0.9 },
    z: { min: -0.5, max: 0.5 },
  },
  chest: {
    x: { min: -0.5, max: 0.7 },
    y: { min: -0.6, max: 0.6 },
    z: { min: -0.5, max: 0.5 },
  },
  leftUpperArm: {
    x: { min: -1.6, max: 1.3 },
    y: { min: -1.575, max: 1.1 },
    z: { min: -0.6, max: 1.5 },
  },
  rightUpperArm: {
    x: { min: -1.6, max: 1.3 },
    y: { min: -1.1, max: 1.575 },
    z: { min: -1.5, max: 0.6 },
  },
  leftLowerArm: {
    x: { min: -1.3, max: 1.3 },
    y: { min: -2.6, max: 0.4 },
    z: { min: -0.8, max: 0.8 },
  },
  rightLowerArm: {
    x: { min: -1.3, max: 1.3 },
    y: { min: -0.4, max: 2.6 },
    z: { min: -0.8, max: 0.8 },
  },
  leftHand: {
    x: { min: -1.8, max: 1.8 },
    y: { min: -1.2, max: 1.2 },
    z: { min: -1.2, max: 1.2 },
  },
  leftThumbMetacarpal: FINGER_LIMITS,
  leftThumbProximal: FINGER_LIMITS,
  leftThumbDistal: FINGER_LIMITS,
  leftIndexProximal: FINGER_LIMITS,
  leftIndexIntermediate: FINGER_LIMITS,
  leftIndexDistal: FINGER_LIMITS,
  leftMiddleProximal: FINGER_LIMITS,
  leftMiddleIntermediate: FINGER_LIMITS,
  leftMiddleDistal: FINGER_LIMITS,
  leftRingProximal: FINGER_LIMITS,
  leftRingIntermediate: FINGER_LIMITS,
  leftRingDistal: FINGER_LIMITS,
  leftLittleProximal: FINGER_LIMITS,
  leftLittleIntermediate: FINGER_LIMITS,
  leftLittleDistal: FINGER_LIMITS,
  rightHand: {
    x: { min: -1.8, max: 1.8 },
    y: { min: -1.2, max: 1.2 },
    z: { min: -1.2, max: 1.2 },
  },
  rightThumbMetacarpal: FINGER_LIMITS,
  rightThumbProximal: FINGER_LIMITS,
  rightThumbDistal: FINGER_LIMITS,
  rightIndexProximal: FINGER_LIMITS,
  rightIndexIntermediate: FINGER_LIMITS,
  rightIndexDistal: FINGER_LIMITS,
  rightMiddleProximal: FINGER_LIMITS,
  rightMiddleIntermediate: FINGER_LIMITS,
  rightMiddleDistal: FINGER_LIMITS,
  rightRingProximal: FINGER_LIMITS,
  rightRingIntermediate: FINGER_LIMITS,
  rightRingDistal: FINGER_LIMITS,
  rightLittleProximal: FINGER_LIMITS,
  rightLittleIntermediate: FINGER_LIMITS,
  rightLittleDistal: FINGER_LIMITS,
};

export function getBoneAxisLimit(
  bone: ControlledBone,
  axis: BoneAxis,
): AxisLimit {
  return SAFE_BONE_LIMITS[bone]?.[axis] ?? DEFAULT_LIMITS[axis];
}

export function clampBoneRotationValue(
  bone: ControlledBone,
  axis: BoneAxis,
  value: number,
): number {
  const limit = getBoneAxisLimit(bone, axis);
  return clamp(value, limit.min, limit.max);
}

export function clampEulerRotation(
  bone: ControlledBone,
  rotation: EulerRotation,
): EulerRotation {
  return {
    x: clampBoneRotationValue(bone, "x", rotation.x),
    y: clampBoneRotationValue(bone, "y", rotation.y),
    z: clampBoneRotationValue(bone, "z", rotation.z),
  };
}

export function clampBonePoseMap(pose: BonePoseMap): BonePoseMap {
  const clamped: BonePoseMap = {};

  for (const [boneName, transform] of Object.entries(pose)) {
    if (!transform) {
      continue;
    }

    const bone = boneName as ControlledBone;
    clamped[bone] = {
      rotation: clampEulerRotation(bone, transform.rotation),
    };
  }

  return clamped;
}
