import type { AvatarAnimationClip } from "@/types/motion";

export const waveRightClip: AvatarAnimationClip = {
  name: "sign-thanks",
  frames: [
    {
      timestampMs: 0,
      bones: {
        rightUpperArm: { rotation: { x: 0, y: 0, z: -1.34 } },
        rightLowerArm: { rotation: { x: 0, y: 0, z: 0 } },

        leftUpperArm: { rotation: { x: -0.09, y: -0.89, z: 1.1 } },
        leftLowerArm: { rotation: { x: -0.02, y: -0.23, z: 0.1 } },
        leftHand: { rotation: { x: 0, y: 0, z: 0 } },
      },
      expressions: {},
    },

    {
      timestampMs: 500,
      bones: {
        rightUpperArm: { rotation: { x: 0.23, y: 0.78, z: -1.16 } },
        rightLowerArm: { rotation: { x: -0.05, y: 2.44, z: 0.08 } },
        rightHand: { rotation: { x: 0.99, y: 0.34, z: -0.07 } },
        rightThumbMetacarpal: { rotation: { x: -0.75, y: -0.32, z: -0.09 } },
        rightThumbProximal: { rotation: { x: 0.98, y: -0.55, z: -0.16 } },
        rightThumbDistal: { rotation: { x: 0, y: 0.04, z: 0 } },
        rightIndexProximal: { rotation: { x: -0.22, y: -0.13, z: 0 } },
        rightIndexIntermediate: { rotation: { x: -0.04, y: 0, z: 0 } },
        rightIndexDistal: { rotation: { x: -0.02, y: 0, z: 0 } },
        rightMiddleProximal: { rotation: { x: -0.15, y: 0, z: 0 } },
        rightMiddleIntermediate: { rotation: { x: -0.04, y: 0, z: 0 } },
        rightMiddleDistal: { rotation: { x: -0.02, y: 0, z: 0 } },
        rightRingProximal: { rotation: { x: 0.04, y: 0.05, z: 0 } },
        rightRingIntermediate: { rotation: { x: -0.05, y: 0, z: 0 } },
        rightRingDistal: { rotation: { x: -0.02, y: 0, z: 0 } },
        rightLittleProximal: { rotation: { x: -0.1, y: 0, z: 0 } },
        rightLittleIntermediate: { rotation: { x: -0.06, y: 0, z: 0 } },
        rightLittleDistal: { rotation: { x: 0.0, y: 0.18, z: -0.11 } },

        leftUpperArm: { rotation: { x: 0.29, y: -0.51, z: 1.18 } },
        leftLowerArm: { rotation: { x: 0.04, y: -2.02, z: 0.02 } },
        leftHand: { rotation: { x: 1.64, y: 0.34, z: 0.71 } },
      },
      expressions: { happy: 0.22 },
    },
    {
      timestampMs: 1200,
      bones: {
        rightUpperArm: { rotation: { x: 0.23, y: 1.03, z: -0.8 } },
        rightLowerArm: { rotation: { x: -0.05, y: 1.64, z: 0.38 } },
        rightHand: { rotation: { x: 1.45, y: 0.33, z: 0 } },

        leftUpperArm: { rotation: { x: 0.42, y: -0.57, z: 1.18 } },
        leftLowerArm: { rotation: { x: 0.04, y: -1.43, z: -0.07 } },
        leftHand: { rotation: { x: 1.64, y: 0.34, z: 0.71 } },
      },
      expressions: { happy: 0.22 },
    },
    {
      timestampMs: 1500,
      bones: {
        rightUpperArm: { rotation: { x: 0, y: 0, z: -1.34 } },
        rightLowerArm: { rotation: { x: 0, y: 0, z: 0 } },
        rightHand: { rotation: { x: 0, y: 0, z: 0 } },
        leftUpperArm: { rotation: { x: -0.09, y: -0.89, z: 1.1 } },
        leftLowerArm: { rotation: { x: -0.02, y: -0.23, z: 0.1 } },
        leftHand: { rotation: { x: 0, y: 0, z: 0 } },
      },
      expressions: { happy: 0 },
    },

    /* {
      timestampMs: 1600,
      bones: {
        rightUpperArm: { rotation: { x: 0.9, y: 0.65, z: -1.34 } },
        rightLowerArm: { rotation: { x: -0.18, y: 1.57, z: 0.3 } },
      },
      expressions: { happy: 0.25 },
    },
    {
      timestampMs: 1850,
      bones: {
        rightUpperArm: { rotation: { x: 0.9, y: 0.65, z: -1.34 } },
        rightLowerArm: { rotation: { x: -0.18, y: 1.57, z: 0.3 } },
      },
      expressions: { happy: 0.28 },
    },
    {
      timestampMs: 1900,
      bones: {
        rightUpperArm: { rotation: { x: 0.9, y: 0.65, z: -1.34 } },
        rightLowerArm: { rotation: { x: -0.18, y: 1.57, z: 0.3 } },
      },
      expressions: { happy: 0.25 },
    },
    {
      timestampMs: 2000,
      bones: {
        rightUpperArm: { rotation: { x: 0, y: 0, z: -1.31 } },
        rightLowerArm: { rotation: { x: 0, y: 0, z: 0 } },
        rightHand: { rotation: { x: 0, y: 0, z: 0 } },
        rightThumbMetacarpal: { rotation: { x: -0.75, y: -0.32, z: -0.09 } },
        rightThumbProximal: { rotation: { x: 0.98, y: -0.55, z: -0.16 } },
        rightThumbDistal: { rotation: { x: 0, y: 0.04, z: 0 } },
        rightIndexProximal: { rotation: { x: -0.22, y: -0.13, z: 0 } },
        rightIndexIntermediate: { rotation: { x: -0.04, y: 0, z: 0 } },
        rightIndexDistal: { rotation: { x: -0.02, y: 0, z: 0 } },
        rightMiddleProximal: { rotation: { x: -0.15, y: 0, z: 0 } },
        rightMiddleIntermediate: { rotation: { x: -0.04, y: 0, z: 0 } },
        rightMiddleDistal: { rotation: { x: -0.02, y: 0, z: 0 } },
        rightRingProximal: { rotation: { x: 0.04, y: 0.05, z: 0 } },
        rightRingIntermediate: { rotation: { x: -0.05, y: 0, z: 0 } },
        rightRingDistal: { rotation: { x: -0.02, y: 0, z: 0 } },
        rightLittleProximal: { rotation: { x: -0.1, y: 0, z: 0 } },
        rightLittleIntermediate: { rotation: { x: -0.06, y: 0, z: 0 } },
        rightLittleDistal: { rotation: { x: 0.0, y: 0.18, z: -0.11 } },
      },
      expressions: { happy: 0 },
    },*/
  ],
};
