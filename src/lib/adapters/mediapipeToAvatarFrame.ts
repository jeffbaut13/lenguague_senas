/**
 * Adaptador de MediaPipe a AvatarFrame
 * Convierte landmarks de cámara a huesos y expresiones del avatar
 *
 * ARQUITECTURA:
 * - Esta función es agnóstica a la fuente (podría ser Kinect, mocap, etc.)
 * - El mapeo actual es SIMPLE (mockeado) para permitir testing
 * - Para producción, aquí iría: IK solver, retargeting avanzado, filtrado de jitter
 *
 * Mapeo de landmarks (MediaPipe Pose 33 landmarks):
 *   Head = NOSE (0) + EAR positions
 *   Torso = MID_HIP + SHOULDERS (11,12)
 *   Arms = SHOULDERS + ELBOWS (13,14) + WRISTS (15,16)
 *   Hands = WRIST (15,16) + FINGERS (17-22)
 */

import type { NormalizedCapture } from "@/types/capture";
import type { AvatarFrame } from "@/types/motion";
import type {
  BonePoseMap,
  AvatarExpression,
  EulerRotation,
  ControlledBone,
} from "@/types/avatar";
import { clampBonePoseMap, getBoneAxisLimit } from "@/lib/animation/boneLimits";
import {
  LEFT_ARM_CALIBRATION_MAP,
  RIGHT_ARM_CALIBRATION_MAP,
  type ArmCalibrationMap,
  type ArmCalibrationRole,
} from "@/mocks/armCalibrationMap.mock";
import { clamp } from "@/utils/clamp";

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ResolvedAxisPercent {
  bone: string;
  axis: "x" | "y" | "z";
  value: number;
  percent: number;
}

export interface BoneIntentResolution {
  bone: string;
  intent: string;
  axis: "x" | "y" | "z";
  value: number;
  percent: number;
}

export interface CalibrationSignalDebug {
  side: "left" | "right";
  forwardRaise: number;
  liftArm: number;
  lateralOpen: number;
  bendElbow: number;
  upperArmTwist: number;
  orientPalm: number;
}

export interface RetargetDebugInfo {
  shoulderAxis: Vec3 | null;
  upAxis: Vec3 | null;
  forwardAxis: Vec3 | null;
  mirrored: boolean;
  poseConfidence: number;
  warnings: string[];
  resolvedAxisPercents: ResolvedAxisPercent[];
  resolvedIntents: BoneIntentResolution[];
  calibrationSignals: CalibrationSignalDebug[];
  incrementalValidation: {
    headOnly: BonePoseMap;
    chestOnly: BonePoseMap;
    rightUpperArmOnly: BonePoseMap;
    torsoAndRightUpperArm: BonePoseMap;
  };
}

type MockScenario = "neutral" | "greeting" | "yes" | "no" | "self" | "hands_up";

/**
 * Mapeo de MediaPipe landmarks a índices
 * Estos son los índices de los landmarks en poseLandmarks[]
 */
const POSE_LANDMARK_INDICES = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
} as const;

/**
 * Mapea blend shapes de MediaPipe a expresiones del avatar
 * Reducción dimensional: 52 blendshapes → 3 expresiones VRM (blink, happy, aa)
 */
function mapBlendshapesToExpressions(
  blendshapes: Record<string, number> | undefined,
): Partial<Record<AvatarExpression, number>> {
  if (!blendshapes) {
    return {};
  }

  const expressions: Partial<Record<AvatarExpression, number>> = {};

  // BLINK: promedio de parpadeos izq/der
  const eyeBlinkLeft = blendshapes["eyeBlinkLeft"] ?? 0;
  const eyeBlinkRight = blendshapes["eyeBlinkRight"] ?? 0;
  expressions.blink = (eyeBlinkLeft + eyeBlinkRight) / 2;

  // HAPPY: combinación de sonrisa + mejillas
  const mouthSmile = blendshapes["mouthSmile"] ?? 0;
  const cheekPuff = blendshapes["cheekPuff"] ?? 0;
  expressions.happy = Math.min(1, (mouthSmile + cheekPuff * 0.5) * 1.2);

  // AA: apertura de boca
  const jawOpen = blendshapes["jawOpen"] ?? 0;
  const mouthOpen = blendshapes["mouthOpen"] ?? 0;
  expressions.aa = Math.max(jawOpen, mouthOpen);

  // Clampear todos los valores a [0, 1]
  Object.keys(expressions).forEach((key) => {
    expressions[key as AvatarExpression] = clamp(
      expressions[key as AvatarExpression]!,
      0,
      1,
    );
  });

  return expressions;
}

function getMockScenario(metadata: Record<string, unknown> | undefined): MockScenario | null {
  const scenario = metadata?.["mockScenario"];
  if (
    scenario === "neutral" ||
    scenario === "greeting" ||
    scenario === "yes" ||
    scenario === "no" ||
    scenario === "self" ||
    scenario === "hands_up"
  ) {
    return scenario;
  }

  return null;
}

function getMockScenarioFrame(
  scenario: MockScenario,
  normalized: NormalizedCapture,
): AvatarFrame {
  const baseExpressions = mapBlendshapesToExpressions(normalized.face?.blendshapes);

  switch (scenario) {
    case "neutral":
      return {
        bones: {},
        expressions: {},
        timestampMs: normalized.timestampMs,
      };

    case "greeting":
      return {
        bones: clampBonePoseMap({
          head: { rotation: { x: -0.08, y: 0.18, z: -0.08 } },
          neck: { rotation: { x: -0.04, y: 0.1, z: -0.05 } },
          rightUpperArm: { rotation: { x: -0.45, y: 0.2, z: -1.2 } },
          rightLowerArm: { rotation: { x: 0.1, y: 1.75, z: 0.2 } },
          rightHand: { rotation: { x: 0.1, y: 0.2, z: -0.25 } },
          leftUpperArm: { rotation: { x: -0.1, y: 0.1, z: 0.35 } },
          leftLowerArm: { rotation: { x: 0, y: -0.35, z: 0 } },
        }),
        expressions: {
          blink: baseExpressions.blink ?? 0.05,
          happy: Math.max(baseExpressions.happy ?? 0, 0.65),
          aa: baseExpressions.aa ?? 0,
        },
        timestampMs: normalized.timestampMs,
      };

    case "yes":
      return {
        bones: clampBonePoseMap({
          head: { rotation: { x: 0.26, y: 0, z: 0 } },
          neck: { rotation: { x: 0.14, y: 0, z: 0 } },
          chest: { rotation: { x: 0.05, y: 0, z: 0 } },
        }),
        expressions: {
          blink: baseExpressions.blink ?? 0.02,
          happy: Math.max(baseExpressions.happy ?? 0, 0.2),
          aa: 0,
        },
        timestampMs: normalized.timestampMs,
      };

    case "no":
      return {
        bones: clampBonePoseMap({
          head: { rotation: { x: 0, y: 0.34, z: -0.05 } },
          neck: { rotation: { x: 0, y: 0.18, z: -0.02 } },
        }),
        expressions: {
          blink: baseExpressions.blink ?? 0.02,
          happy: 0,
          aa: 0,
        },
        timestampMs: normalized.timestampMs,
      };

    case "self":
      return {
        bones: clampBonePoseMap({
          head: { rotation: { x: -0.04, y: 0.08, z: 0 } },
          neck: { rotation: { x: -0.02, y: 0.04, z: 0 } },
          rightUpperArm: { rotation: { x: -0.38, y: 0.18, z: -0.9 } },
          rightLowerArm: { rotation: { x: 0.15, y: 1.45, z: 0.18 } },
          rightHand: { rotation: { x: 0.12, y: 0.1, z: -0.3 } },
        }),
        expressions: {
          blink: baseExpressions.blink ?? 0,
          happy: Math.max(baseExpressions.happy ?? 0, 0.15),
          aa: 0,
        },
        timestampMs: normalized.timestampMs,
      };

    case "hands_up":
      return {
        bones: clampBonePoseMap({
          head: { rotation: { x: -0.05, y: 0, z: 0 } },
          neck: { rotation: { x: -0.02, y: 0, z: 0 } },
          leftUpperArm: { rotation: { x: -0.3, y: -0.2, z: 1.25 } },
          leftLowerArm: { rotation: { x: 0.15, y: -0.3, z: -0.1 } },
          leftHand: { rotation: { x: 0.15, y: -0.1, z: 0.2 } },
          rightUpperArm: { rotation: { x: -0.3, y: 0.2, z: -1.25 } },
          rightLowerArm: { rotation: { x: 0.15, y: 0.3, z: 0.1 } },
          rightHand: { rotation: { x: 0.15, y: 0.1, z: -0.2 } },
        }),
        expressions: {
          blink: baseExpressions.blink ?? 0.03,
          happy: Math.max(baseExpressions.happy ?? 0, 0.75),
          aa: 0,
        },
        timestampMs: normalized.timestampMs,
      };
  }
}

function toVec3(value: { x: number; y: number; z: number }): Vec3 {
  return { x: value.x, y: value.y, z: value.z };
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function normalize(v: Vec3): Vec3 | null {
  const len = length(v);
  if (len < 1e-6) {
    return null;
  }

  return {
    x: v.x / len,
    y: v.y / len,
    z: v.z / len,
  };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function average(a: Vec3, b: Vec3): Vec3 {
  return scale(add(a, b), 0.5);
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function signedPercent(value: number, direction: "positive" | "negative"): number {
  return clamp01(direction === "positive" ? Math.max(0, value) : Math.max(0, -value));
}

function roleToValue(role: ArmCalibrationRole, signalPercent: number): number {
  const limit = getBoneAxisLimit(role.bone, role.axis);
  const directionalLimit = role.direction === "positive" ? limit.max : Math.abs(limit.min);
  return directionalLimit * role.percent * clamp01(signalPercent) * (role.direction === "positive" ? 1 : -1);
}

function addAxisRotation(
  bones: BonePoseMap,
  bone: ControlledBone,
  axis: "x" | "y" | "z",
  value: number,
) {
  const previousRotation = bones[bone]?.rotation ?? { x: 0, y: 0, z: 0 };
  bones[bone] = {
    rotation: {
      ...previousRotation,
      [axis]: previousRotation[axis] + value,
    },
  };
}

function applyCalibrationRole(
  bones: BonePoseMap,
  role: ArmCalibrationRole,
  signalPercent: number,
) {
  const value = roleToValue(role, signalPercent);
  if (Math.abs(value) < 0.0001) {
    return;
  }

  addAxisRotation(bones, role.bone, role.axis, value);
}

function angleBetween(a: Vec3, b: Vec3): number {
  return Math.acos(clamp(dot(a, b), -1, 1));
}

function resolveArmCalibrationSignals(args: {
  side: "left" | "right";
  calibrationMap: ArmCalibrationMap;
  shoulderAxis: Vec3 | null;
  upAxis: Vec3 | null;
  forwardAxis: Vec3 | null;
  upperArmDirection: Vec3 | null;
  forearmDirection: Vec3 | null;
}): CalibrationSignalDebug {
  const lateralBase =
    args.shoulderAxis && args.upperArmDirection
      ? dot(args.upperArmDirection, args.shoulderAxis) * (args.side === "right" ? 1 : -1)
      : 0;
  const forwardBase =
    args.forwardAxis && args.upperArmDirection
      ? dot(args.upperArmDirection, args.forwardAxis)
      : 0;
  const liftBase =
    args.upAxis && args.upperArmDirection ? dot(args.upperArmDirection, args.upAxis) : 0;
  const bendBase =
    args.upperArmDirection && args.forearmDirection
      ? angleBetween(args.upperArmDirection, args.forearmDirection) / Math.PI
      : 0;
  const twistPlaneNormal =
    args.upperArmDirection && args.forearmDirection
      ? normalize(cross(args.upperArmDirection, args.forearmDirection))
      : null;
  const twistBase =
    twistPlaneNormal && args.forwardAxis ? dot(twistPlaneNormal, args.forwardAxis) : 0;
  const orientPalmBase =
    args.forearmDirection && args.forwardAxis ? dot(args.forearmDirection, args.forwardAxis) : 0;

  return {
    side: args.side,
    forwardRaise: signedPercent(forwardBase, args.calibrationMap.forwardRaise.direction),
    liftArm: signedPercent(liftBase, args.calibrationMap.liftArm.direction),
    lateralOpen: signedPercent(lateralBase, args.calibrationMap.lateralOpen.direction),
    bendElbow: clamp01(bendBase),
    upperArmTwist: signedPercent(twistBase, args.calibrationMap.upperArmTwist.direction),
    orientPalm: signedPercent(orientPalmBase, args.calibrationMap.orientPalm.direction),
  };
}

function applyArmCalibration(
  bones: BonePoseMap,
  calibrationMap: ArmCalibrationMap,
  signals: CalibrationSignalDebug,
) {
  applyCalibrationRole(bones, calibrationMap.forwardRaise, signals.forwardRaise);
  applyCalibrationRole(bones, calibrationMap.liftArm, signals.liftArm);
  applyCalibrationRole(bones, calibrationMap.lateralOpen, signals.lateralOpen);
  applyCalibrationRole(bones, calibrationMap.upperArmTwist, signals.upperArmTwist);
  applyCalibrationRole(bones, calibrationMap.bendElbow, signals.bendElbow);
  applyCalibrationRole(bones, calibrationMap.orientPalm, signals.orientPalm);
}

function dampHeadRotation(
  rotation: EulerRotation,
  poseConfidence: number,
  forwardAxisReliable: boolean,
): EulerRotation {
  const confidenceFactor = clamp((poseConfidence - 0.35) / 0.35, 0, 1);
  const reliabilityFactor = forwardAxisReliable ? 1 : 0.35;
  const factor = confidenceFactor * reliabilityFactor;

  return {
    x: clamp(rotation.x * 0.35 * factor, -0.22, 0.22),
    y: clamp(rotation.y * 0.55 * factor, -0.45, 0.45),
    z: clamp(rotation.z * 0.2 * factor, -0.12, 0.12),
  };
}

function stripArmBones(bones: BonePoseMap): BonePoseMap {
  const nextBones = { ...bones };
  const armBones: ControlledBone[] = [
    "leftUpperArm",
    "leftLowerArm",
    "leftHand",
    "rightUpperArm",
    "rightLowerArm",
    "rightHand",
  ];

  for (const bone of armBones) {
    delete nextBones[bone];
  }

  return nextBones;
}

function createArmsDownFallbackPose(): BonePoseMap {
  return {
    leftUpperArm: {
      rotation: { x: 0, y: 0, z: -0.35 },
    },
    leftLowerArm: {
      rotation: { x: 0.05, y: -0.05, z: 0 },
    },
    leftHand: {
      rotation: { x: 0, y: 0, z: 0 },
    },
    rightUpperArm: {
      rotation: { x: 0, y: 0, z: 0.35 },
    },
    rightLowerArm: {
      rotation: { x: 0.05, y: 0.05, z: 0 },
    },
    rightHand: {
      rotation: { x: 0, y: 0, z: 0 },
    },
  };
}

function createResolvedAxisPercents(bones: BonePoseMap): ResolvedAxisPercent[] {
  const resolved: ResolvedAxisPercent[] = [];

  for (const [boneName, transform] of Object.entries(bones)) {
    if (!transform) {
      continue;
    }

    for (const axis of ["x", "y", "z"] as const) {
      const value = transform.rotation[axis];
      if (!Number.isFinite(value) || Math.abs(value) < 0.0001) {
        continue;
      }

      const limit = getBoneAxisLimit(boneName as ControlledBone, axis);
      const directionalLimit = value >= 0 ? limit.max : Math.abs(limit.min);
      const percent = directionalLimit > 0 ? value / directionalLimit : 0;

      resolved.push({
        bone: boneName,
        axis,
        value,
        percent,
      });
    }
  }

  return resolved;
}

function createResolvedIntents(
  axisPercents: ResolvedAxisPercent[],
): BoneIntentResolution[] {
  return axisPercents.map((item) => {
    let intent = "rotation";

    if (item.bone.includes("UpperArm")) {
      if (item.axis === "x") intent = "upperArmTwist";
      if (item.axis === "y") intent = "forwardOrLateralRaise";
      if (item.axis === "z") intent = "liftArm";
    } else if (item.bone.includes("LowerArm")) {
      intent = item.axis === "y" ? "bendElbow" : "forearmAdjust";
    } else if (item.bone.includes("Hand")) {
      intent = item.axis === "y" ? "orientPalm" : "handAdjust";
    } else if (item.bone === "chest") {
      intent = "torsoOrientation";
    } else if (item.bone === "neck" || item.bone === "head") {
      intent = "headOrientation";
    }

    return {
      bone: item.bone,
      axis: item.axis,
      value: item.value,
      percent: item.percent,
      intent,
    };
  });
}

function parseMirroredFlag(metadata: Record<string, unknown> | undefined): boolean {
  return (
    metadata?.["mirrored"] === true ||
    metadata?.["isMirrored"] === true ||
    metadata?.["cameraMirrored"] === true
  );
}

function parseMirrorAlreadyAppliedFlag(
  metadata: Record<string, unknown> | undefined,
): boolean {
  return (
    metadata?.["mirrorApplied"] === true ||
    metadata?.["xMirrorApplied"] === true ||
    metadata?.["axisXMirrored"] === true
  );
}

function maybeMirrorX(v: Vec3, mirrored: boolean): Vec3 {
  if (!mirrored) {
    return v;
  }

  return { x: -v.x, y: v.y, z: v.z };
}

function toForwardYawPitch(forward: Vec3): { yaw: number; pitch: number } {
  const yaw = Math.atan2(forward.x, forward.z);
  const pitch = Math.atan2(forward.y, Math.sqrt(forward.x * forward.x + forward.z * forward.z));
  return { yaw, pitch };
}

function buildRetargetFromPose(normalized: NormalizedCapture): {
  bones: BonePoseMap;
  debug: RetargetDebugInfo;
} {
  const lm = normalized.pose.landmarks;
  const bones: BonePoseMap = {};

  const leftShoulder = lm[POSE_LANDMARK_INDICES.LEFT_SHOULDER];
  const rightShoulder = lm[POSE_LANDMARK_INDICES.RIGHT_SHOULDER];
  const leftHip = lm[POSE_LANDMARK_INDICES.LEFT_HIP];
  const rightHip = lm[POSE_LANDMARK_INDICES.RIGHT_HIP];
  const nose = lm[POSE_LANDMARK_INDICES.NOSE];
  const leftElbow = lm[POSE_LANDMARK_INDICES.LEFT_ELBOW];
  const rightElbow = lm[POSE_LANDMARK_INDICES.RIGHT_ELBOW];
  const leftWrist = lm[POSE_LANDMARK_INDICES.LEFT_WRIST];
  const rightWrist = lm[POSE_LANDMARK_INDICES.RIGHT_WRIST];

  const mirroredRequested = parseMirroredFlag(normalized.metadata);
  const mirrorAlreadyApplied = parseMirrorAlreadyAppliedFlag(normalized.metadata);
  const mirrored = mirroredRequested && !mirrorAlreadyApplied;

  const shoulderAxisRaw =
    leftShoulder && rightShoulder
      ? normalize(
          subtract(
            maybeMirrorX(toVec3(rightShoulder), mirrored),
            maybeMirrorX(toVec3(leftShoulder), mirrored),
          ),
        )
      : null;

  const shoulderCenter =
    leftShoulder && rightShoulder
      ? average(maybeMirrorX(toVec3(leftShoulder), mirrored), maybeMirrorX(toVec3(rightShoulder), mirrored))
      : null;
  const hipCenter =
    leftHip && rightHip
      ? average(maybeMirrorX(toVec3(leftHip), mirrored), maybeMirrorX(toVec3(rightHip), mirrored))
      : null;

  const upAxis =
    shoulderCenter && hipCenter ? normalize(subtract(shoulderCenter, hipCenter)) : null;

  let forwardAxis =
    shoulderAxisRaw && upAxis ? normalize(cross(shoulderAxisRaw, upAxis)) : null;

  if (forwardAxis && shoulderCenter && nose) {
    const chestToNose = normalize(
      subtract(maybeMirrorX(toVec3(nose), mirrored), shoulderCenter),
    );

    // Si el forward queda invertido respecto al frente de la cabeza, invertirlo.
    if (chestToNose && dot(forwardAxis, chestToNose) < 0) {
      forwardAxis = scale(forwardAxis, -1);
    }
  }

  if (forwardAxis) {
    const chestAngles = toForwardYawPitch(forwardAxis);
    const chestRoll = shoulderAxisRaw ? Math.atan2(shoulderAxisRaw.y, shoulderAxisRaw.x) * 0.3 : 0;
    bones.chest = {
      rotation: {
        x: -chestAngles.pitch * 0.8,
        y: chestAngles.yaw,
        z: chestRoll,
      },
    };
  }

  if (forwardAxis && shoulderCenter && nose) {
    const headForward = normalize(
      subtract(maybeMirrorX(toVec3(nose), mirrored), shoulderCenter),
    );

    if (headForward) {
      const chestAngles = toForwardYawPitch(forwardAxis);
      const headAngles = toForwardYawPitch(headForward);

      // Conversión aproximada world->local de cabeza respecto a torso.
      const localHead: EulerRotation = {
        x: -(headAngles.pitch - chestAngles.pitch),
        y: headAngles.yaw - chestAngles.yaw,
        z: 0,
      };
      const conservativeHead = dampHeadRotation(
        localHead,
        normalized.pose.confidence,
        Boolean(forwardAxis),
      );

      bones.head = { rotation: conservativeHead };
      bones.neck = {
        rotation: {
          x: conservativeHead.x * 0.7,
          y: conservativeHead.y * 0.7,
          z: conservativeHead.z * 0.5,
        },
      };
    }
  }

  if (rightShoulder && rightElbow) {
    const armDirection = normalize(
      subtract(
        maybeMirrorX(toVec3(rightElbow), mirrored),
        maybeMirrorX(toVec3(rightShoulder), mirrored),
      ),
    );

    if (armDirection) {
      const chestYaw = bones.chest?.rotation.y ?? 0;
      const chestPitch = bones.chest?.rotation.x ?? 0;

      // Conversión aproximada world->local para brazo superior derecho.
      bones.rightUpperArm = {
        rotation: {
          x: Math.atan2(armDirection.y, Math.sqrt(armDirection.x * armDirection.x + armDirection.z * armDirection.z)) - chestPitch,
          y: Math.atan2(armDirection.x, armDirection.z) - chestYaw,
          z: 0,
        },
      };
    }
  }

  if (leftShoulder && leftElbow) {
    const armDirection = normalize(
      subtract(
        maybeMirrorX(toVec3(leftElbow), mirrored),
        maybeMirrorX(toVec3(leftShoulder), mirrored),
      ),
    );

    if (armDirection) {
      const chestYaw = bones.chest?.rotation.y ?? 0;
      const chestPitch = bones.chest?.rotation.x ?? 0;

      bones.leftUpperArm = {
        rotation: {
          x:
            Math.atan2(
              armDirection.y,
              Math.sqrt(armDirection.x * armDirection.x + armDirection.z * armDirection.z),
            ) - chestPitch,
          y: Math.atan2(armDirection.x, armDirection.z) - chestYaw,
          z: 0,
        },
      };
    }
  }

  if (rightElbow && rightWrist) {
    const forearmDirection = normalize(
      subtract(
        maybeMirrorX(toVec3(rightWrist), mirrored),
        maybeMirrorX(toVec3(rightElbow), mirrored),
      ),
    );

    if (forearmDirection) {
      const upperYaw = bones.rightUpperArm?.rotation.y ?? 0;
      const upperPitch = bones.rightUpperArm?.rotation.x ?? 0;
      bones.rightLowerArm = {
        rotation: {
          x: Math.atan2(forearmDirection.y, Math.sqrt(forearmDirection.x * forearmDirection.x + forearmDirection.z * forearmDirection.z)) - upperPitch,
          y: Math.atan2(forearmDirection.x, forearmDirection.z) - upperYaw,
          z: 0,
        },
      };
    }
  }

  if (leftElbow && leftWrist) {
    const forearmDirection = normalize(
      subtract(
        maybeMirrorX(toVec3(leftWrist), mirrored),
        maybeMirrorX(toVec3(leftElbow), mirrored),
      ),
    );

    if (forearmDirection) {
      const upperYaw = bones.leftUpperArm?.rotation.y ?? 0;
      const upperPitch = bones.leftUpperArm?.rotation.x ?? 0;
      bones.leftLowerArm = {
        rotation: {
          x:
            Math.atan2(
              forearmDirection.y,
              Math.sqrt(
                forearmDirection.x * forearmDirection.x +
                  forearmDirection.z * forearmDirection.z,
              ),
            ) - upperPitch,
          y: Math.atan2(forearmDirection.x, forearmDirection.z) - upperYaw,
          z: 0,
        },
      };
    }
  }

  const rightUpperArmDirection =
    rightShoulder && rightElbow
      ? normalize(
          subtract(
            maybeMirrorX(toVec3(rightElbow), mirrored),
            maybeMirrorX(toVec3(rightShoulder), mirrored),
          ),
        )
      : null;
  const rightForearmDirection =
    rightElbow && rightWrist
      ? normalize(
          subtract(
            maybeMirrorX(toVec3(rightWrist), mirrored),
            maybeMirrorX(toVec3(rightElbow), mirrored),
          ),
        )
      : null;
  const leftUpperArmDirection =
    leftShoulder && leftElbow
      ? normalize(
          subtract(
            maybeMirrorX(toVec3(leftElbow), mirrored),
            maybeMirrorX(toVec3(leftShoulder), mirrored),
          ),
        )
      : null;
  const leftForearmDirection =
    leftElbow && leftWrist
      ? normalize(
          subtract(
            maybeMirrorX(toVec3(leftWrist), mirrored),
            maybeMirrorX(toVec3(leftElbow), mirrored),
          ),
        )
      : null;

  const calibrationSignals: CalibrationSignalDebug[] = [];
  const calibratedArmBones: BonePoseMap = {};
  const armRetargetReliable = normalized.pose.confidence >= 0.55 && Boolean(forwardAxis);

  if (armRetargetReliable) {
    const rightSignals = resolveArmCalibrationSignals({
      side: "right",
      calibrationMap: RIGHT_ARM_CALIBRATION_MAP,
      shoulderAxis: shoulderAxisRaw,
      upAxis,
      forwardAxis,
      upperArmDirection: rightUpperArmDirection,
      forearmDirection: rightForearmDirection,
    });
    calibrationSignals.push(rightSignals);
    applyArmCalibration(calibratedArmBones, RIGHT_ARM_CALIBRATION_MAP, rightSignals);

    const leftSignals = resolveArmCalibrationSignals({
      side: "left",
      calibrationMap: LEFT_ARM_CALIBRATION_MAP,
      shoulderAxis: shoulderAxisRaw,
      upAxis,
      forwardAxis,
      upperArmDirection: leftUpperArmDirection,
      forearmDirection: leftForearmDirection,
    });
    calibrationSignals.push(leftSignals);
    applyArmCalibration(calibratedArmBones, LEFT_ARM_CALIBRATION_MAP, leftSignals);

    Object.assign(bones, calibratedArmBones);
  }

  const clampedBones = clampBonePoseMap(
    armRetargetReliable
      ? bones
      : {
          ...stripArmBones(bones),
          ...createArmsDownFallbackPose(),
        },
  );
  const resolvedAxisPercents = createResolvedAxisPercents(clampedBones);
  const resolvedIntents = createResolvedIntents(resolvedAxisPercents);
  const warnings: string[] = [];

  if (!forwardAxis) {
    warnings.push("torso forward ambiguous");
  }
  if (!armRetargetReliable) {
    warnings.push("arm retarget disabled: low confidence or ambiguous torso");
  }
  if (mirroredRequested && mirrorAlreadyApplied) {
    warnings.push("mirrored state conflict");
  }
  if (!clampedBones.rightUpperArm && !clampedBones.leftUpperArm) {
    warnings.push("bone intent unresolved: upper arms");
  }
  if (!clampedBones.rightLowerArm && !clampedBones.leftLowerArm) {
    warnings.push("bone intent unresolved: lower arms");
  }
  if (!clampedBones.rightHand && !clampedBones.leftHand) {
    warnings.push("bone intent unresolved: hands");
  }
  if (resolvedAxisPercents.some((item) => Math.abs(item.percent) > 1.01)) {
    warnings.push("percentage out of range");
  }
  if (normalized.source === "mediapipe") {
    warnings.push("hand orientation approximated without MediaPipe Hands");
  }

  const debug: RetargetDebugInfo = {
    shoulderAxis: shoulderAxisRaw,
    upAxis,
    forwardAxis,
    mirrored,
    poseConfidence: normalized.pose.confidence,
    warnings,
    resolvedAxisPercents,
    resolvedIntents,
    calibrationSignals,
    incrementalValidation: {
      headOnly: clampedBones.head ? { head: clampedBones.head, neck: clampedBones.neck } : {},
      chestOnly: clampedBones.chest ? { chest: clampedBones.chest } : {},
      rightUpperArmOnly: clampedBones.rightUpperArm ? { rightUpperArm: clampedBones.rightUpperArm } : {},
      torsoAndRightUpperArm: clampBonePoseMap({
        ...(clampedBones.chest ? { chest: clampedBones.chest } : {}),
        ...(clampedBones.rightUpperArm ? { rightUpperArm: clampedBones.rightUpperArm } : {}),
      }),
    },
  };

  return {
    bones: clampedBones,
    debug,
  };
}

/**
 * Adapter principal: NormalizedCapture → AvatarFrame
 * Este es el corazón del pipeline de retargeting
 */
export function normalizedCaptureToAvatarFrame(
  normalized: NormalizedCapture,
): AvatarFrame {
  const mockScenario = normalized.source === "mock"
    ? getMockScenario(normalized.metadata)
    : null;

  if (mockScenario) {
    return getMockScenarioFrame(mockScenario, normalized);
  }

  const { bones } = buildRetargetFromPose(normalized);

  // ===== DEDOS (SIMPLIFICADO) =====
  // Para testing, usamos una posición simplificada
  // Producción requeriría analizar cada dedo individualmente
  if (
    normalized.rightHand &&
    normalized.rightHand.landmarks &&
    normalized.rightHand.landmarks.length > 0
  ) {
    // Wrist está en [0], tip del pulgar en [4], etc.
    // Simplificación: si la mano está abierta, dedos extendidos
    const wristConfidence = normalized.rightHand.confidence;

    if (wristConfidence > 0.5) {
      // Pulgar
      bones.rightThumbProximal = {
        rotation: { x: -0.3, y: 0, z: 0.2 },
      };

      // Otros dedos: posición abierta simple
      bones.rightIndexProximal = {
        rotation: { x: -0.2, y: 0, z: 0 },
      };
      bones.rightMiddleProximal = {
        rotation: { x: -0.2, y: 0, z: 0 },
      };
      bones.rightRingProximal = {
        rotation: { x: -0.2, y: 0, z: 0 },
      };
      bones.rightLittleProximal = {
        rotation: { x: -0.2, y: 0, z: 0 },
      };
    }
  }

  // ===== EXPRESIONES FACIALES =====
  const expressions = mapBlendshapesToExpressions(normalized.face?.blendshapes);

  return {
    bones,
    expressions,
    timestampMs: normalized.timestampMs,
  };
}

export function getRetargetDebugInfo(
  normalized: NormalizedCapture,
): RetargetDebugInfo {
  return buildRetargetFromPose(normalized).debug;
}

/**
 * Versión legacy: adaptador directo de MediaPipe (sin normalización previa)
 * Mantiene compatibilidad si algo aún lo usa
 */
export interface MediaPipeLandmarksInput {
  pose?: unknown;
  hands?: unknown;
  face?: unknown;
}

export function mediapipeToAvatarFrame(
  input: MediaPipeLandmarksInput,
): AvatarFrame {
  // TODO: Implementar mapeo directo si es necesario
  // Por ahora, delegamos a la versión normalizada
  void input;

  return {
    bones: {},
    expressions: {},
  };
}
