import { demoExpressions } from "@/mocks/avatarExpressions.mock";
import { demoPose } from "@/mocks/avatarPose.mock";
import {
  LEFT_ARM_CALIBRATION_MAP,
  RIGHT_ARM_CALIBRATION_MAP,
  getCalibrationRoleValue,
} from "@/mocks/armCalibrationMap.mock";
import type { AvatarFrame, AvatarKeyframe } from "@/types/motion";

export const mockAvatarFrame: AvatarFrame = {
  bones: {
    head: { rotation: { x: 0.05, y: 0.25, z: 0 } },
    leftUpperArm: { rotation: { x: -0.8, y: 0.2, z: 0.1 } },
    leftLowerArm: { rotation: { x: -0.5, y: 0, z: 0 } },
  },
  expressions: {
    blink: 0,
    happy: 0.6,
    aa: 0.2,
  },
};

export const demoPoseFrame: AvatarFrame = {
  bones: demoPose,
  expressions: {},
};

export const demoExpressionFrame: AvatarFrame = {
  bones: {},
  expressions: demoExpressions,
};

export const validationRightHandChinPoseMock = {
  name: "validation-right-hand-chin",
  frame: {
    timestampMs: 0,
    bones: {
      chest: { rotation: { x: 0.04, y: -0.08, z: 0.02 } },
      neck: { rotation: { x: 0.03, y: -0.12, z: 0.0 } },
      head: { rotation: { x: 0.06, y: -0.18, z: 0.0 } },
      rightUpperArm: { rotation: { x: -0.18, y: 0.22, z: 0.92 } },
      rightLowerArm: { rotation: { x: -0.42, y: 0.1, z: 1.05 } },
      rightHand: { rotation: { x: 0.04, y: 0.28, z: 0.1 } },
      leftUpperArm: { rotation: { x: 0.1, y: -0.08, z: -0.22 } },
      leftLowerArm: { rotation: { x: 0.04, y: 0.0, z: -0.08 } },
      leftHand: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
    },
    expressions: {
      blink: 0,
      happy: 0.12,
      aa: 0,
    },
    metadata: {
      label: "Validation pose: right hand near chin",
      purpose: "pre-mediapipe retarget validation",
    },
  },
} as const;

export const validationRightHandChinFrame: AvatarKeyframe = {
  timestampMs: validationRightHandChinPoseMock.frame.timestampMs,
  bones: validationRightHandChinPoseMock.frame.bones,
  expressions: validationRightHandChinPoseMock.frame.expressions,
};

export const validationRightHandChinCalibratedPoseMock = {
  name: "validation-right-hand-chin-calibrated",
  frame: {
    timestampMs: 0,
    bones: {
      chest: { rotation: { x: 0.04, y: -0.08, z: 0.02 } },
      neck: { rotation: { x: 0.03, y: -0.12, z: 0.0 } },
      head: { rotation: { x: 0.06, y: -0.18, z: 0.0 } },
      rightUpperArm: { rotation: { x: -0.18, y: 0.18, z: -1.05 } },
      rightLowerArm: { rotation: { x: -0.08, y: 1.05, z: 0.1 } },
      rightHand: { rotation: { x: 0.04, y: 0.32, z: 0.08 } },
      leftUpperArm: { rotation: { x: 0.08, y: -0.06, z: -0.12 } },
      leftLowerArm: { rotation: { x: 0.02, y: 0.0, z: -0.04 } },
      leftHand: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
    },
    expressions: {
      blink: 0,
      happy: 0.12,
      aa: 0,
    },
    metadata: {
      label: "Validation pose calibrated: right hand near chin",
      purpose: "arm-axis calibration before mediapipe retarget",
    },
  },
} as const;

export const validationRightHandChinCalibratedFrame: AvatarKeyframe = {
  timestampMs: validationRightHandChinCalibratedPoseMock.frame.timestampMs,
  bones: validationRightHandChinCalibratedPoseMock.frame.bones,
  expressions: validationRightHandChinCalibratedPoseMock.frame.expressions,
};

export const validationRightHandChinFinalPoseMock = {
  name: "validation-right-hand-chin-final",
  frame: {
    timestampMs: 0,
    bones: {
      chest: { rotation: { x: 0.04, y: -0.08, z: 0.02 } },
      neck: { rotation: { x: 0.03, y: -0.12, z: 0.0 } },
      head: { rotation: { x: 0.06, y: -0.18, z: 0.0 } },
      rightUpperArm: {
        rotation: {
          x: getCalibrationRoleValue(RIGHT_ARM_CALIBRATION_MAP.upperArmTwist),
          y: getCalibrationRoleValue(RIGHT_ARM_CALIBRATION_MAP.lateralOpen),
          z: getCalibrationRoleValue(RIGHT_ARM_CALIBRATION_MAP.liftArm),
        },
      },
      rightLowerArm: {
        rotation: {
          x: -0.06,
          y: getCalibrationRoleValue(RIGHT_ARM_CALIBRATION_MAP.bendElbow),
          z: 0.08,
        },
      },
      rightHand: {
        rotation: {
          x: 0.06,
          y: getCalibrationRoleValue(RIGHT_ARM_CALIBRATION_MAP.orientPalm),
          z: 0.06,
        },
      },
      leftUpperArm: {
        rotation: {
          x: getCalibrationRoleValue(LEFT_ARM_CALIBRATION_MAP.upperArmTwist),
          y: getCalibrationRoleValue(LEFT_ARM_CALIBRATION_MAP.lateralOpen),
          z: getCalibrationRoleValue(LEFT_ARM_CALIBRATION_MAP.liftArm),
        },
      },
      leftLowerArm: {
        rotation: {
          x: 0.02,
          y: getCalibrationRoleValue(LEFT_ARM_CALIBRATION_MAP.bendElbow),
          z: -0.04,
        },
      },
      leftHand: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
    },
    expressions: {
      blink: 0,
      happy: 0.12,
      aa: 0,
    },
    metadata: {
      label: "Validation pose final: right hand near chin",
      purpose: "final composed pose using explicit arm calibration map",
    },
  },
} as const;

export const validationRightHandChinFinalFrame: AvatarKeyframe = {
  timestampMs: validationRightHandChinFinalPoseMock.frame.timestampMs,
  bones: validationRightHandChinFinalPoseMock.frame.bones,
  expressions: validationRightHandChinFinalPoseMock.frame.expressions,
};

export const rightForwardRaise90PoseMock = {
  name: "RightForwardRaise90",
  frame: {
    timestampMs: 0,
    bones: {
      rightUpperArm: {
        rotation: {
          x: 0.0,
          y: getCalibrationRoleValue(RIGHT_ARM_CALIBRATION_MAP.forwardRaise),
          z: 0.0,
        },
      },
      rightLowerArm: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
      rightHand: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
      leftUpperArm: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
      leftLowerArm: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
      leftHand: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
      chest: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
      neck: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
      head: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
    },
    expressions: {
      blink: 0,
      happy: 0,
      aa: 0,
    },
    metadata: {
      intent: "forwardRaise",
      side: "right",
      targetDegrees: 90,
      calibratedAxis: RIGHT_ARM_CALIBRATION_MAP.forwardRaise.axis,
      calibratedDirection: RIGHT_ARM_CALIBRATION_MAP.forwardRaise.direction,
      calibratedPercent: RIGHT_ARM_CALIBRATION_MAP.forwardRaise.percent,
      calibratedValue: getCalibrationRoleValue(RIGHT_ARM_CALIBRATION_MAP.forwardRaise),
    },
  },
} as const;

export const rightForwardRaise90Frame: AvatarKeyframe = {
  timestampMs: rightForwardRaise90PoseMock.frame.timestampMs,
  bones: rightForwardRaise90PoseMock.frame.bones,
  expressions: rightForwardRaise90PoseMock.frame.expressions,
};

export const bothForwardRaise90PoseMock = {
  name: "BothForwardRaise90",
  frame: {
    timestampMs: 0,
    bones: {
      rightUpperArm: {
        rotation: {
          x: 0.0,
          y: getCalibrationRoleValue(RIGHT_ARM_CALIBRATION_MAP.forwardRaise),
          z: 0.0,
        },
      },
      rightLowerArm: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
      rightHand: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
      leftUpperArm: {
        rotation: {
          x: 0.0,
          y: getCalibrationRoleValue(LEFT_ARM_CALIBRATION_MAP.forwardRaise),
          z: 0.0,
        },
      },
      leftLowerArm: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
      leftHand: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
      chest: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
      neck: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
      head: { rotation: { x: 0.0, y: 0.0, z: 0.0 } },
    },
    expressions: {
      blink: 0,
      happy: 0,
      aa: 0,
    },
    metadata: {
      intent: "forwardRaise",
      side: "both",
      targetDegrees: 90,
      rightCalibratedAxis: RIGHT_ARM_CALIBRATION_MAP.forwardRaise.axis,
      rightCalibratedDirection: RIGHT_ARM_CALIBRATION_MAP.forwardRaise.direction,
      rightCalibratedPercent: RIGHT_ARM_CALIBRATION_MAP.forwardRaise.percent,
      rightCalibratedValue: getCalibrationRoleValue(RIGHT_ARM_CALIBRATION_MAP.forwardRaise),
      leftCalibratedAxis: LEFT_ARM_CALIBRATION_MAP.forwardRaise.axis,
      leftCalibratedDirection: LEFT_ARM_CALIBRATION_MAP.forwardRaise.direction,
      leftCalibratedPercent: LEFT_ARM_CALIBRATION_MAP.forwardRaise.percent,
      leftCalibratedValue: getCalibrationRoleValue(LEFT_ARM_CALIBRATION_MAP.forwardRaise),
    },
  },
} as const;

export const bothForwardRaise90Frame: AvatarKeyframe = {
  timestampMs: bothForwardRaise90PoseMock.frame.timestampMs,
  bones: bothForwardRaise90PoseMock.frame.bones,
  expressions: bothForwardRaise90PoseMock.frame.expressions,
};
