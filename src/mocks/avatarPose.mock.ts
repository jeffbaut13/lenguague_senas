import type { BonePoseMap } from "@/types/avatar";

export function createNeutralBonePose(): BonePoseMap {
  return {
    head: { rotation: { x: 0, y: 0, z: 0 } },
    neck: { rotation: { x: 0, y: 0, z: 0 } },
    chest: { rotation: { x: 0, y: 0, z: 0 } },
    leftUpperArm: { rotation: { x: 0, y: 0, z: 0 } },
    leftLowerArm: { rotation: { x: 0, y: 0, z: 0 } },
    leftHand: { rotation: { x: 0, y: 0, z: 0 } },
    leftThumbMetacarpal: { rotation: { x: 0, y: 0, z: 0 } },
    leftThumbProximal: { rotation: { x: 0, y: 0, z: 0 } },
    leftThumbDistal: { rotation: { x: 0, y: 0, z: 0 } },
    leftIndexProximal: { rotation: { x: 0, y: 0, z: 0 } },
    leftIndexIntermediate: { rotation: { x: 0, y: 0, z: 0 } },
    leftIndexDistal: { rotation: { x: 0, y: 0, z: 0 } },
    leftMiddleProximal: { rotation: { x: 0, y: 0, z: 0 } },
    leftMiddleIntermediate: { rotation: { x: 0, y: 0, z: 0 } },
    leftMiddleDistal: { rotation: { x: 0, y: 0, z: 0 } },
    leftRingProximal: { rotation: { x: 0, y: 0, z: 0 } },
    leftRingIntermediate: { rotation: { x: 0, y: 0, z: 0 } },
    leftRingDistal: { rotation: { x: 0, y: 0, z: 0 } },
    leftLittleProximal: { rotation: { x: 0, y: 0, z: 0 } },
    leftLittleIntermediate: { rotation: { x: 0, y: 0, z: 0 } },
    leftLittleDistal: { rotation: { x: 0, y: 0, z: 0 } },
    rightUpperArm: { rotation: { x: 0, y: 0, z: 0 } },
    rightLowerArm: { rotation: { x: 0, y: 0, z: 0 } },
    rightHand: { rotation: { x: 0, y: 0, z: 0 } },
    rightThumbMetacarpal: { rotation: { x: 0, y: 0, z: 0 } },
    rightThumbProximal: { rotation: { x: 0, y: 0, z: 0 } },
    rightThumbDistal: { rotation: { x: 0, y: 0, z: 0 } },
    rightIndexProximal: { rotation: { x: 0, y: 0, z: 0 } },
    rightIndexIntermediate: { rotation: { x: 0, y: 0, z: 0 } },
    rightIndexDistal: { rotation: { x: 0, y: 0, z: 0 } },
    rightMiddleProximal: { rotation: { x: 0, y: 0, z: 0 } },
    rightMiddleIntermediate: { rotation: { x: 0, y: 0, z: 0 } },
    rightMiddleDistal: { rotation: { x: 0, y: 0, z: 0 } },
    rightRingProximal: { rotation: { x: 0, y: 0, z: 0 } },
    rightRingIntermediate: { rotation: { x: 0, y: 0, z: 0 } },
    rightRingDistal: { rotation: { x: 0, y: 0, z: 0 } },
    rightLittleProximal: { rotation: { x: 0, y: 0, z: 0 } },
    rightLittleIntermediate: { rotation: { x: 0, y: 0, z: 0 } },
    rightLittleDistal: { rotation: { x: 0, y: 0, z: 0 } },
  };
}

export function createDefaultBonePose(): BonePoseMap {
  return createNeutralBonePose();
}

export const demoPose: BonePoseMap = {
  head: { rotation: { x: 0.1, y: 0.35, z: 0 } },
  leftUpperArm: { rotation: { x: -1.1, y: 0.25, z: 0.1 } },
  leftLowerArm: { rotation: { x: -0.55, y: 0, z: 0 } },
  leftHand: { rotation: { x: 0.1, y: 0, z: -0.15 } },
};
