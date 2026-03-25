import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import type { Landmark, RawCapture } from "@/types/capture";

function createPoseLandmark(
  x: number,
  y: number,
  z: number,
  confidence?: number,
  visibility?: number,
): Landmark {
  return {
    x,
    y,
    z,
    confidence,
    visibility,
  };
}

export function poseLandmarkerToRawCapture(args: {
  result: PoseLandmarkerResult;
  timestampMs: number;
  mirrored: boolean;
  source?: string;
}): RawCapture | null {
  const firstPose = args.result.landmarks[0];
  const firstWorldPose = args.result.worldLandmarks[0];

  if (!firstPose || firstPose.length === 0) {
    return null;
  }

  const poseLandmarks = firstPose.map((landmark, index) => {
    const world = firstWorldPose?.[index];
    return createPoseLandmark(
      world?.x ?? landmark.x,
      world?.y ?? landmark.y,
      world?.z ?? landmark.z,
      landmark.visibility ?? 0,
      landmark.visibility ?? 0,
    );
  });

  const confidence =
    firstPose.reduce((sum, landmark) => sum + (landmark.visibility ?? 0), 0) /
    firstPose.length;

  return {
    timestampMs: args.timestampMs,
    poseLandmarks,
    leftHandLandmarks: [],
    rightHandLandmarks: [],
    faceLandmarks: [],
    faceBlendshapes: {},
    confidence,
    source: args.source ?? "mediapipe",
    metadata: {
      mirrored: args.mirrored,
      poseDetected: true,
      poseLandmarksImage: firstPose.map((landmark) => ({
        x: landmark.x,
        y: landmark.y,
        z: landmark.z,
        visibility: landmark.visibility ?? 0,
      })),
      poseLandmarksWorld: firstWorldPose?.map((landmark) => ({
        x: landmark.x,
        y: landmark.y,
        z: landmark.z,
        visibility: landmark.visibility ?? 0,
      })) ?? [],
    },
  };
}
