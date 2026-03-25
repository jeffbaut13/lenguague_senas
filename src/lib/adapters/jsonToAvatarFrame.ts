import { CONTROLLED_EXPRESSIONS, type AvatarExpression } from "@/types/avatar";
import type { AvatarFrame, AvatarFrameJSON } from "@/types/motion";

export function jsonToAvatarFrame(input: AvatarFrameJSON): AvatarFrame {
  const expressions: Partial<Record<AvatarExpression, number>> = {};

  for (const key of CONTROLLED_EXPRESSIONS) {
    const value = input.expressions?.[key];
    if (typeof value === "number") {
      expressions[key] = value;
    }
  }

  const bones: AvatarFrame["bones"] = {};

  if (input.bones) {
    for (const [boneName, transform] of Object.entries(input.bones)) {
      if (!transform?.rotation) {
        continue;
      }

      bones[boneName as keyof AvatarFrame["bones"]] = {
        rotation: {
          x: transform.rotation.x ?? 0,
          y: transform.rotation.y ?? 0,
          z: transform.rotation.z ?? 0,
        },
      };
    }
  }

  return {
    bones,
    expressions,
  };
}
