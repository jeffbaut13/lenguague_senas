import type {
  AvatarExpression,
  BonePoseMap,
  ControlledBone,
  EulerRotation,
} from "@/types/avatar";

export interface AvatarFrame {
  bones: BonePoseMap;
  expressions: Partial<Record<AvatarExpression, number>>;
  timestampMs?: number;
}

export interface AvatarKeyframe extends AvatarFrame {
  timestampMs: number;
}

export interface AvatarAnimationClip {
  name: string;
  frames: AvatarKeyframe[];
}

export interface AvatarFrameJSON {
  bones?: Partial<Record<ControlledBone, { rotation?: Partial<EulerRotation> }>>;
  expressions?: Partial<Record<AvatarExpression, number>>;
}

export type AvatarFrameSource = "mock" | "json" | "mediapipe";
