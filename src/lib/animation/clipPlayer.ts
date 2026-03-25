import { clamp } from "@/utils/clamp";
import type { AvatarFrame, AvatarKeyframe, AvatarAnimationClip } from "@/types/motion";

type OnFrame = (frame: AvatarFrame) => void;

type ClipPlayerOptions = {
  clip: AvatarAnimationClip;
  onFrame: OnFrame;
  onComplete?: () => void;
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolateFrames(
  from: AvatarKeyframe,
  to: AvatarKeyframe,
  alpha: number,
): AvatarFrame {
  const t = clamp(alpha, 0, 1);
  const frame: AvatarFrame = { bones: {}, expressions: {} };

  const boneKeys = new Set([
    ...Object.keys(from.bones),
    ...Object.keys(to.bones),
  ]);

  for (const key of boneKeys) {
    const bone = key as keyof AvatarFrame["bones"];
    const fromBone = from.bones[bone];
    const toBone = to.bones[bone];

    if (!fromBone && !toBone) {
      continue;
    }

    const fromRotation = fromBone?.rotation ?? { x: 0, y: 0, z: 0 };
    const toRotation = toBone?.rotation ?? fromRotation;

    frame.bones[bone] = {
      rotation: {
        x: lerp(fromRotation.x, toRotation.x, t),
        y: lerp(fromRotation.y, toRotation.y, t),
        z: lerp(fromRotation.z, toRotation.z, t),
      },
    };
  }

  const expressionKeys = new Set([
    ...Object.keys(from.expressions),
    ...Object.keys(to.expressions),
  ]);

  for (const key of expressionKeys) {
    const fromValue = from.expressions[key as keyof typeof from.expressions] ?? 0;
    const toValue = to.expressions[key as keyof typeof to.expressions] ?? fromValue;
    frame.expressions[key as keyof typeof frame.expressions] = lerp(
      fromValue,
      toValue,
      t,
    );
  }

  return frame;
}

function getSortedKeyframes(clip: AvatarAnimationClip): AvatarKeyframe[] {
  return [...clip.frames].sort((a, b) => a.timestampMs - b.timestampMs);
}

export function sampleAvatarClipAtTime(
  clip: AvatarAnimationClip,
  elapsedMs: number,
): AvatarFrame {
  const keyframes = getSortedKeyframes(clip);

  if (keyframes.length === 0) {
    return { bones: {}, expressions: {} };
  }

  if (keyframes.length === 1 || elapsedMs <= keyframes[0].timestampMs) {
    return keyframes[0];
  }

  const lastFrame = keyframes[keyframes.length - 1];
  if (elapsedMs >= lastFrame.timestampMs) {
    return lastFrame;
  }

  for (let i = 0; i < keyframes.length - 1; i += 1) {
    const from = keyframes[i];
    const to = keyframes[i + 1];

    if (elapsedMs < from.timestampMs || elapsedMs > to.timestampMs) {
      continue;
    }

    const duration = Math.max(1, to.timestampMs - from.timestampMs);
    const alpha = (elapsedMs - from.timestampMs) / duration;
    return interpolateFrames(from, to, alpha);
  }

  return lastFrame;
}

export function startAvatarClipPlayer(options: ClipPlayerOptions): () => void {
  const keyframes = getSortedKeyframes(options.clip);

  if (keyframes.length === 0) {
    options.onComplete?.();
    return () => undefined;
  }

  if (keyframes.length === 1) {
    options.onFrame(keyframes[0]);
    options.onComplete?.();
    return () => undefined;
  }

  let rafId = 0;
  let stopped = false;
  const firstTime = keyframes[0].timestampMs;
  const lastTime = keyframes[keyframes.length - 1].timestampMs;
  const start = performance.now() - firstTime;

  const stop = () => {
    if (stopped) {
      return;
    }
    stopped = true;
    window.cancelAnimationFrame(rafId);
  };

  const tick = () => {
    if (stopped) {
      return;
    }

    const elapsed = performance.now() - start;

    if (elapsed >= lastTime) {
      options.onFrame(keyframes[keyframes.length - 1]);
      stop();
      options.onComplete?.();
      return;
    }

    options.onFrame(sampleAvatarClipAtTime(options.clip, elapsed));

    rafId = window.requestAnimationFrame(tick);
  };

  rafId = window.requestAnimationFrame(tick);
  return stop;
}
