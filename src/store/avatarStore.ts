import { create } from "zustand";
import {
  neutralExpressions,
  demoExpressions,
} from "@/mocks/avatarExpressions.mock";
import {
  createDefaultBonePose,
  demoPose,
} from "@/mocks/avatarPose.mock";
import {
  bothForwardRaise90Frame,
  bothForwardRaise90PoseMock,
  validationRightHandChinFinalFrame,
  validationRightHandChinFinalPoseMock,
  mockAvatarFrame,
  rightForwardRaise90Frame,
  rightForwardRaise90PoseMock,
  validationRightHandChinCalibratedFrame,
  validationRightHandChinCalibratedPoseMock,
  validationRightHandChinFrame,
  validationRightHandChinPoseMock,
} from "@/mocks/avatarFrame.mock";
import type { AvatarCalibrationTest } from "@/mocks/avatarCalibration.mock";
import { clampBonePoseMap, clampBoneRotationValue } from "@/lib/animation/boneLimits";
import { startAvatarClipPlayer } from "@/lib/animation/clipPlayer";
import type {
  AvatarExpression,
  AvatarPreset,
  BoneAxis,
  BonePoseMap,
  ControlledBone,
  ExpressionState,
} from "@/types/avatar";
import type { AvatarAnimationClip, AvatarFrame } from "@/types/motion";
import { clamp01 } from "@/utils/clamp";

interface AvatarStoreState {
  avatarLoaded: boolean;
  isPlayingClip: boolean;
  activeClipName: string | null;
  clipStopper?: () => void;
  currentBonePose: BonePoseMap;
  currentExpressions: ExpressionState;
  selectedPreset: AvatarPreset;
  activePoseName: string | null;
  activeCalibrationTest: Pick<
    AvatarCalibrationTest,
    "name" | "bone" | "axis" | "value"
  > | null;
  mockFrame: AvatarFrame;
  setAvatarLoaded: (loaded: boolean) => void;
  updateBoneRotation: (
    bone: ControlledBone,
    axis: BoneAxis,
    value: number,
  ) => void;
  setExpression: (expression: AvatarExpression, value: number) => void;
  resetPose: () => void;
  resetExpressions: () => void;
  applyAvatarFrame: (frame: AvatarFrame, preset?: AvatarPreset, poseName?: string | null) => void;
  applyMockFrame: () => void;
  applyValidationRightHandChinPose: () => void;
  applyValidationRightHandChinCalibratedPose: () => void;
  applyValidationRightHandChinFinalPose: () => void;
  applyRightForwardRaise90Pose: () => void;
  applyBothForwardRaise90Pose: () => void;
  applyCalibrationTest: (test: AvatarCalibrationTest) => void;
  playDemoPose: () => void;
  playDemoExpressions: () => void;
  playAnimationClip: (clip: AvatarAnimationClip) => void;
  stopAnimationClip: () => void;
}

const ZERO_ROTATION = { x: 0, y: 0, z: 0 };

function createBasePose(): BonePoseMap {
  return createDefaultBonePose();
}

function createResolvedPose(pose: BonePoseMap): BonePoseMap {
  return {
    ...createBasePose(),
    ...clampBonePoseMap(pose),
  };
}

function createResolvedExpressions(
  expressions: Partial<ExpressionState>,
): ExpressionState {
  return {
    ...neutralExpressions,
    blink: clamp01(expressions.blink ?? neutralExpressions.blink),
    happy: clamp01(expressions.happy ?? neutralExpressions.happy),
    aa: clamp01(expressions.aa ?? neutralExpressions.aa),
  };
}

export const useAvatarStore = create<AvatarStoreState>((set, get) => ({
  avatarLoaded: false,
  isPlayingClip: false,
  activeClipName: null,
  clipStopper: undefined,
  currentBonePose: createBasePose(),
  currentExpressions: { ...neutralExpressions },
  selectedPreset: "none",
  activePoseName: null,
  activeCalibrationTest: null,
  mockFrame: mockAvatarFrame,

  setAvatarLoaded: (loaded) => set({ avatarLoaded: loaded }),

  updateBoneRotation: (bone, axis, value) => {
    set((state) => {
      const previous = state.currentBonePose[bone]?.rotation ?? ZERO_ROTATION;
      const clampedValue = clampBoneRotationValue(bone, axis, value);

      return {
        currentBonePose: {
          ...state.currentBonePose,
          [bone]: {
            rotation: {
              ...previous,
              [axis]: clampedValue,
            },
          },
        },
      };
    });
  },

  setExpression: (expression, value) => {
    set((state) => ({
      currentExpressions: {
        ...state.currentExpressions,
        [expression]: clamp01(value),
      },
    }));
  },

  resetPose: () => {
    set({
      currentBonePose: createBasePose(),
      selectedPreset: "none",
      activePoseName: null,
      activeCalibrationTest: null,
    });
  },

  resetExpressions: () => {
    set({
      currentExpressions: { ...neutralExpressions },
      selectedPreset: "none",
      activePoseName: null,
      activeCalibrationTest: null,
    });
  },

  applyAvatarFrame: (frame, preset = "none", poseName = null) => {
    set(() => ({
      currentBonePose: createResolvedPose(frame.bones),
      currentExpressions: createResolvedExpressions(frame.expressions),
      selectedPreset: preset,
      activePoseName: poseName,
      activeCalibrationTest: null,
    }));
  },

  applyMockFrame: () => {
    const state = get();
    state.applyAvatarFrame(state.mockFrame, "mock-json");
  },

  applyValidationRightHandChinPose: () => {
    get().applyAvatarFrame(
      validationRightHandChinFrame,
      "validation-pose",
      validationRightHandChinPoseMock.name,
    );
  },

  applyValidationRightHandChinCalibratedPose: () => {
    get().applyAvatarFrame(
      validationRightHandChinCalibratedFrame,
      "validation-pose",
      validationRightHandChinCalibratedPoseMock.name,
    );
  },

  applyValidationRightHandChinFinalPose: () => {
    get().applyAvatarFrame(
      validationRightHandChinFinalFrame,
      "validation-pose",
      validationRightHandChinFinalPoseMock.name,
    );
  },

  applyRightForwardRaise90Pose: () => {
    get().applyAvatarFrame(
      rightForwardRaise90Frame,
      "validation-pose",
      rightForwardRaise90PoseMock.name,
    );
  },

  applyBothForwardRaise90Pose: () => {
    get().applyAvatarFrame(
      bothForwardRaise90Frame,
      "validation-pose",
      bothForwardRaise90PoseMock.name,
    );
  },

  applyCalibrationTest: (test) => {
    get().applyAvatarFrame(test.frame, "validation-pose", test.name);
    set({
      activeCalibrationTest: {
        name: test.name,
        bone: test.bone,
        axis: test.axis,
        value: test.value,
      },
    });
  },

  playDemoPose: () => {
    set(() => ({
      currentBonePose: createResolvedPose(demoPose),
      selectedPreset: "demo-pose",
      activePoseName: null,
      activeCalibrationTest: null,
    }));
  },

  playDemoExpressions: () => {
    set(() => ({
      currentExpressions: createResolvedExpressions(demoExpressions),
      selectedPreset: "demo-expressions",
      activePoseName: null,
      activeCalibrationTest: null,
    }));
  },

  playAnimationClip: (clip) => {
    const existingStopper = get().clipStopper;
    existingStopper?.();

    if (typeof window === "undefined") {
      return;
    }

    set({
      isPlayingClip: true,
      activeClipName: clip.name,
      selectedPreset: "wave-clip",
      activePoseName: null,
      activeCalibrationTest: null,
    });

    const stop = startAvatarClipPlayer({
      clip,
      onFrame: (frame) => {
        get().applyAvatarFrame(frame, "wave-clip", clip.name);
      },
      onComplete: () => {
        set({
          isPlayingClip: false,
          activeClipName: null,
          clipStopper: undefined,
        });
      },
    });

    set({ clipStopper: stop });
  },

  stopAnimationClip: () => {
    const stop = get().clipStopper;
    stop?.();
    set({
      isPlayingClip: false,
      activeClipName: null,
      clipStopper: undefined,
      activePoseName: null,
      activeCalibrationTest: null,
    });
  },
}));
