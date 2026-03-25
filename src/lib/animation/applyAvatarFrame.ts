import type { VRM } from "@pixiv/three-vrm";
import { applyBonePose } from "@/lib/animation/applyBonePose";
import { applyExpressionState } from "@/lib/animation/applyExpressionState";
import type { AvatarFrame } from "@/types/motion";

export function applyAvatarFrame(vrm: VRM, frame: AvatarFrame): void {
  applyBonePose(vrm, frame.bones);
  applyExpressionState(vrm, frame.expressions);
}
