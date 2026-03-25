export const CONTROLLED_BONES = [
  "head",
  "neck",
  "chest",
  "leftUpperArm",
  "leftLowerArm",
  "leftHand",
  "leftThumbMetacarpal",
  "leftThumbProximal",
  "leftThumbDistal",
  "leftIndexProximal",
  "leftIndexIntermediate",
  "leftIndexDistal",
  "leftMiddleProximal",
  "leftMiddleIntermediate",
  "leftMiddleDistal",
  "leftRingProximal",
  "leftRingIntermediate",
  "leftRingDistal",
  "leftLittleProximal",
  "leftLittleIntermediate",
  "leftLittleDistal",
  "rightUpperArm",
  "rightLowerArm",
  "rightHand",
  "rightThumbMetacarpal",
  "rightThumbProximal",
  "rightThumbDistal",
  "rightIndexProximal",
  "rightIndexIntermediate",
  "rightIndexDistal",
  "rightMiddleProximal",
  "rightMiddleIntermediate",
  "rightMiddleDistal",
  "rightRingProximal",
  "rightRingIntermediate",
  "rightRingDistal",
  "rightLittleProximal",
  "rightLittleIntermediate",
  "rightLittleDistal",
] as const;

export type ControlledBone = (typeof CONTROLLED_BONES)[number];

export const CONTROLLED_EXPRESSIONS = ["blink", "happy", "aa"] as const;

export type AvatarExpression = (typeof CONTROLLED_EXPRESSIONS)[number];

export type BoneAxis = "x" | "y" | "z";

export interface EulerRotation {
  x: number;
  y: number;
  z: number;
}

export interface BoneTransform {
  rotation: EulerRotation;
}

export type BonePoseMap = Partial<Record<ControlledBone, BoneTransform>>;

export type ExpressionState = Record<AvatarExpression, number>;

export type AvatarPreset =
  | "none"
  | "demo-pose"
  | "demo-expressions"
  | "mock-json"
  | "wave-clip"
  | "validation-pose"
  | "mediapipe-pose-live";
