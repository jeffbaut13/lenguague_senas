import type { AvatarFrame } from "@/types/motion";

function lerp(a: number, b: number, alpha: number): number {
  return a + (b - a) * alpha;
}

export function smoothAvatarFrame(
  previous: AvatarFrame | null,
  next: AvatarFrame,
  alpha = 0.35,
): AvatarFrame {
  if (!previous) {
    return next;
  }

  const frame: AvatarFrame = {
    bones: {},
    expressions: {},
    timestampMs: next.timestampMs,
  };

  const boneKeys = new Set([
    ...Object.keys(previous.bones),
    ...Object.keys(next.bones),
  ]);

  for (const key of boneKeys) {
    const previousBone = previous.bones[key as keyof typeof previous.bones];
    const nextBone = next.bones[key as keyof typeof next.bones];

    if (!nextBone && !previousBone) {
      continue;
    }

    const prevRotation = previousBone?.rotation ?? { x: 0, y: 0, z: 0 };
    const nextRotation = nextBone?.rotation ?? { x: 0, y: 0, z: 0 };

    frame.bones[key as keyof typeof frame.bones] = {
      rotation: {
        x: lerp(prevRotation.x, nextRotation.x, alpha),
        y: lerp(prevRotation.y, nextRotation.y, alpha),
        z: lerp(prevRotation.z, nextRotation.z, alpha),
      },
    };
  }

  const expressionKeys = new Set([
    ...Object.keys(previous.expressions),
    ...Object.keys(next.expressions),
  ]);

  for (const key of expressionKeys) {
    const prevValue = previous.expressions[key as keyof typeof previous.expressions] ?? 0;
    const nextValue = next.expressions[key as keyof typeof next.expressions] ?? 0;
    frame.expressions[key as keyof typeof frame.expressions] = lerp(
      prevValue,
      nextValue,
      alpha,
    );
  }

  return frame;
}
