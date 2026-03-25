import {
  ARM_CALIBRATION_MAP_ROWS,
  LEFT_ARM_CALIBRATION_MAP,
  RIGHT_ARM_CALIBRATION_MAP,
  getCalibrationRoleValue,
} from "@/mocks/armCalibrationMap.mock";
import type { BoneAxis, ControlledBone } from "@/types/avatar";
import type { AvatarFrame } from "@/types/motion";

export interface AvatarCalibrationTest {
  id: string;
  name: string;
  bone: ControlledBone;
  axis: BoneAxis;
  value: number;
  frame: AvatarFrame;
  expectedEffect: string;
  orientation?: "positive" | "negative";
}

const CALIBRATION_VALUE = 1.31;
function createCalibrationTest(
  bone: ControlledBone,
  axis: BoneAxis,
  expectedEffect: string,
  orientation?: "positive" | "negative",
): AvatarCalibrationTest {
  return {
    id: `${bone}-${axis}-${orientation ?? "plus"}`,
    name: `${bone} ${axis}${orientation === "positive" ? "+" : orientation === "negative" ? "-" : ""}`,
    bone,
    axis,
    value: CALIBRATION_VALUE,
    expectedEffect,
    orientation,
    frame: {
      bones: {
        [bone]: {
          rotation: {
            x:
              axis === "x"
                ? orientation === "positive"
                  ? CALIBRATION_VALUE
                  : -CALIBRATION_VALUE
                : 0,
            y:
              axis === "y"
                ? orientation === "positive"
                  ? CALIBRATION_VALUE
                  : -CALIBRATION_VALUE
                : 0,
            z:
              axis === "z"
                ? orientation === "positive"
                  ? CALIBRATION_VALUE
                  : -CALIBRATION_VALUE
                : 0,
          },
        },
      },
      expressions: {},
    },
  };
}

export const AVATAR_ARM_CALIBRATION_TESTS: AvatarCalibrationTest[] = [
  createCalibrationTest(
    "rightUpperArm",
    "x",
    "Prueba de swing frontal del hombro derecho.",
    "positive",
  ),
  createCalibrationTest(
    "rightUpperArm",
    "y",
    "Prueba de twist/apertura lateral del hombro derecho.",
    "positive",
  ),
  createCalibrationTest(
    "rightUpperArm",
    "z",
    "Prueba de elevacion del brazo derecho.",
    "positive",
  ),

  createCalibrationTest(
    "rightLowerArm",
    "y",
    "Prueba principal de flexion del codo derecho.",
    "positive",
  ),
  createCalibrationTest(
    "rightLowerArm",
    "z",
    "Prueba secundaria de roll del antebrazo derecho.",
    "positive",
  ),
  createCalibrationTest(
    "rightHand",
    "x",
    "Prueba de pitch de la mano derecha.",
    "positive",
  ),
  createCalibrationTest(
    "rightHand",
    "y",
    "Prueba de yaw de la mano derecha.",
    "positive",
  ),
  createCalibrationTest(
    "rightHand",
    "z",
    "Prueba de roll de la mano derecha.",
    "positive",
  ),
  createCalibrationTest(
    "leftUpperArm",
    "x",
    "Prueba de swing frontal del hombro izquierdo.",
    "positive",
  ),
  createCalibrationTest(
    "leftUpperArm",
    "y",
    "Prueba de twist/apertura lateral del hombro izquierdo.",
    "negative",
  ),
  createCalibrationTest(
    "leftUpperArm",
    "z",
    "Prueba de elevacion del brazo izquierdo.",
    "negative",
  ),

  createCalibrationTest(
    "leftLowerArm",
    "y",
    "Prueba principal de flexion del codo izquierdo.",
    "negative",
  ),
  createCalibrationTest(
    "leftLowerArm",
    "z",
    "Prueba secundaria de roll del antebrazo izquierdo.",
    "negative",
  ),
  createCalibrationTest(
    "leftHand",
    "x",
    "Prueba de pitch de la mano izquierda.",
    "negative",
  ),
  createCalibrationTest(
    "leftHand",
    "y",
    "Prueba de yaw de la mano izquierda.",
    "negative",
  ),
  createCalibrationTest(
    "leftHand",
    "z",
    "Prueba de roll de la mano izquierda.",
    "negative",
  ),
];

export const AVATAR_ARM_CALIBRATION_SUMMARY = [
  {
    label: "Eje que levanta el brazo",
    result:
      `${RIGHT_ARM_CALIBRATION_MAP.liftArm.bone}.${RIGHT_ARM_CALIBRATION_MAP.liftArm.axis}${RIGHT_ARM_CALIBRATION_MAP.liftArm.direction === "positive" ? "+" : "-"} usa ${(RIGHT_ARM_CALIBRATION_MAP.liftArm.percent * 100).toFixed(0)}% del limite y resuelve a ${getCalibrationRoleValue(RIGHT_ARM_CALIBRATION_MAP.liftArm).toFixed(2)} rad.`,
  },
  {
    label: "Eje que lleva el brazo al frente",
    result:
      `${RIGHT_ARM_CALIBRATION_MAP.forwardRaise.bone}.${RIGHT_ARM_CALIBRATION_MAP.forwardRaise.axis}${RIGHT_ARM_CALIBRATION_MAP.forwardRaise.direction === "positive" ? "+" : "-"} usa ${(RIGHT_ARM_CALIBRATION_MAP.forwardRaise.percent * 100).toFixed(0)}% del limite y resuelve a ${getCalibrationRoleValue(RIGHT_ARM_CALIBRATION_MAP.forwardRaise).toFixed(2)} rad.`,
  },
  {
    label: "Eje que lo abre lateralmente",
    result:
      `${RIGHT_ARM_CALIBRATION_MAP.lateralOpen.bone}.${RIGHT_ARM_CALIBRATION_MAP.lateralOpen.axis}+ usa ${(RIGHT_ARM_CALIBRATION_MAP.lateralOpen.percent * 100).toFixed(0)}% del limite positivo para abrir lateral/diagonalmente.`,
  },
  {
    label: "Eje que rota/torce upper arm",
    result:
      `${RIGHT_ARM_CALIBRATION_MAP.upperArmTwist.bone}.${RIGHT_ARM_CALIBRATION_MAP.upperArmTwist.axis}${RIGHT_ARM_CALIBRATION_MAP.upperArmTwist.direction === "positive" ? "+" : "-"} usa ${(RIGHT_ARM_CALIBRATION_MAP.upperArmTwist.percent * 100).toFixed(0)}% del limite para torsion fina del hombro.`,
  },
  {
    label: "Eje que dobla el codo",
    result:
      `${RIGHT_ARM_CALIBRATION_MAP.bendElbow.bone}.${RIGHT_ARM_CALIBRATION_MAP.bendElbow.axis}${RIGHT_ARM_CALIBRATION_MAP.bendElbow.direction === "positive" ? "+" : "-"} usa ${(RIGHT_ARM_CALIBRATION_MAP.bendElbow.percent * 100).toFixed(0)}% del limite y es la flexion principal del codo derecho.`,
  },
  {
    label: "Eje que orienta la mano",
    result:
      `${RIGHT_ARM_CALIBRATION_MAP.orientPalm.bone}.${RIGHT_ARM_CALIBRATION_MAP.orientPalm.axis}${RIGHT_ARM_CALIBRATION_MAP.orientPalm.direction === "positive" ? "+" : "-"} usa ${(RIGHT_ARM_CALIBRATION_MAP.orientPalm.percent * 100).toFixed(0)}% del limite para orientar la palma derecha.`,
  },
];

export {
  ARM_CALIBRATION_MAP_ROWS,
  RIGHT_ARM_CALIBRATION_MAP,
  LEFT_ARM_CALIBRATION_MAP,
  getCalibrationRoleValue,
};
