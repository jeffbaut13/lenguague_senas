import { getBoneAxisLimit } from "@/lib/animation/boneLimits";
import type { BoneAxis, ControlledBone } from "@/types/avatar";

export interface ArmCalibrationRole {
  bone: ControlledBone;
  axis: BoneAxis;
  direction: "positive" | "negative";
  percent: number;
  note: string;
}

export interface ArmCalibrationMap {
  forwardRaise: ArmCalibrationRole;
  liftArm: ArmCalibrationRole;
  lateralOpen: ArmCalibrationRole;
  upperArmTwist: ArmCalibrationRole;
  bendElbow: ArmCalibrationRole;
  orientPalm: ArmCalibrationRole;
}

export const RIGHT_ARM_CALIBRATION_MAP: ArmCalibrationMap = {
  forwardRaise: {
    bone: "rightUpperArm",
    axis: "y",
    direction: "positive",
    percent: 1,
    note: "Configuracion usada para llevar el brazo derecho al frente; inferida de la validacion manual reportada para y+.",
  },
  liftArm: {
    bone: "rightUpperArm",
    axis: "z",
    direction: "negative",
    percent: 0.72,
    note: "Eje principal para elevar el brazo derecho hacia la zona de la barbilla.",
  },
  lateralOpen: {
    bone: "rightUpperArm",
    axis: "y",
    direction: "positive",
    percent: 0.21,
    note: "Segun la prueba manual, y+ abre el brazo en diagonal/lateral.",
  },
  upperArmTwist: {
    bone: "rightUpperArm",
    axis: "x",
    direction: "negative",
    percent: 0.1,
    note: "Ajuste fino de torsion del hombro para acercar el codo al frente.",
  },
  bendElbow: {
    bone: "rightLowerArm",
    axis: "y",
    direction: "positive",
    percent: 0.39,
    note: "Flexion principal del codo derecho en este avatar.",
  },
  orientPalm: {
    bone: "rightHand",
    axis: "y",
    direction: "positive",
    percent: 0.28,
    note: "Yaw de la mano para orientar la palma hacia el menton.",
  },
};

export const LEFT_ARM_CALIBRATION_MAP: Pick<
  ArmCalibrationMap,
  "forwardRaise" | "liftArm" | "lateralOpen" | "upperArmTwist" | "bendElbow" | "orientPalm"
> = {
  forwardRaise: {
    bone: "leftUpperArm",
    axis: "y",
    direction: "negative",
    percent: 1,
    note: "El brazo izquierdo queda neutro en esta validacion; esta entrada existe para mantener el mapa simetrico y editable.",
  },
  liftArm: {
    bone: "leftUpperArm",
    axis: "z",
    direction: "negative",
    percent: 0.23,
    note: "Contrapeso leve del hombro izquierdo para mantener naturalidad.",
  },
  lateralOpen: {
    bone: "leftUpperArm",
    axis: "y",
    direction: "negative",
    percent: 0.05,
    note: "Apertura lateral suave del brazo izquierdo en reposo.",
  },
  upperArmTwist: {
    bone: "leftUpperArm",
    axis: "x",
    direction: "positive",
    percent: 0.04,
    note: "Torsion leve para evitar rigidez del hombro izquierdo.",
  },
  bendElbow: {
    bone: "leftLowerArm",
    axis: "y",
    direction: "negative",
    percent: 0.02,
    note: "Flexion minima para que el brazo izquierdo no quede totalmente bloqueado.",
  },
  orientPalm: {
    bone: "leftHand",
    axis: "y",
    direction: "negative",
    percent: 0,
    note: "La mano izquierda permanece neutra en esta pose.",
  },
};

export function getCalibrationRoleValue(role: ArmCalibrationRole): number {
  const limit = getBoneAxisLimit(role.bone, role.axis);
  const directionalLimit = role.direction === "positive" ? limit.max : Math.abs(limit.min);
  return directionalLimit * role.percent * (role.direction === "positive" ? 1 : -1);
}

export const ARM_CALIBRATION_MAP_ROWS = [
  {
    role: "Forward raise",
    config: RIGHT_ARM_CALIBRATION_MAP.forwardRaise,
  },
  {
    role: "Levantar brazo",
    config: RIGHT_ARM_CALIBRATION_MAP.liftArm,
  },
  {
    role: "Abrir lateralmente",
    config: RIGHT_ARM_CALIBRATION_MAP.lateralOpen,
  },
  {
    role: "Rotar/torcer upper arm",
    config: RIGHT_ARM_CALIBRATION_MAP.upperArmTwist,
  },
  {
    role: "Doblar codo",
    config: RIGHT_ARM_CALIBRATION_MAP.bendElbow,
  },
  {
    role: "Orientar palma",
    config: RIGHT_ARM_CALIBRATION_MAP.orientPalm,
  },
];
