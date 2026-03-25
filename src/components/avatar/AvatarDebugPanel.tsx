"use client";

import { BoneControls } from "@/components/avatar/BoneControls";
import { MediaPipePoseDebugPanel } from "@/components/avatar/MediaPipePoseDebugPanel";
import {
  bothForwardRaise90PoseMock,
  rightForwardRaise90PoseMock,
  validationRightHandChinCalibratedPoseMock,
  validationRightHandChinFinalPoseMock,
  validationRightHandChinPoseMock,
} from "@/mocks/avatarFrame.mock";
import {
  ARM_CALIBRATION_MAP_ROWS,
} from "@/mocks/avatarCalibration.mock";
import { getCalibrationRoleValue } from "@/mocks/armCalibrationMap.mock";
import { useAvatarStore } from "@/store/avatarStore";

function ActionButton(props: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "default";
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={
        props.variant === "primary"
          ? "rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
          : "rounded-md border border-panel-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-slate-100"
      }
    >
      {props.label}
    </button>
  );
}

export function AvatarDebugPanel() {
  const avatarLoaded = useAvatarStore((state) => state.avatarLoaded);
  const activePoseName = useAvatarStore((state) => state.activePoseName);

  const applyValidationRightHandChinPose = useAvatarStore(
    (state) => state.applyValidationRightHandChinPose,
  );
  const applyValidationRightHandChinCalibratedPose = useAvatarStore(
    (state) => state.applyValidationRightHandChinCalibratedPose,
  );
  const applyValidationRightHandChinFinalPose = useAvatarStore(
    (state) => state.applyValidationRightHandChinFinalPose,
  );
  const applyRightForwardRaise90Pose = useAvatarStore(
    (state) => state.applyRightForwardRaise90Pose,
  );
  const applyBothForwardRaise90Pose = useAvatarStore(
    (state) => state.applyBothForwardRaise90Pose,
  );
  const resetPose = useAvatarStore((state) => state.resetPose);
  const resetExpressions = useAvatarStore((state) => state.resetExpressions);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-text">Poses del Avatar</h1>
        <p className="text-sm text-muted">
          Solo poses creadas, un reset y debug colapsable.
        </p>
      </div>

      <div className="rounded-md border border-panel-border bg-surface p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-text">Estado VRM</span>
          <span
            className={
              avatarLoaded
                ? "rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                : "rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700"
            }
          >
            {avatarLoaded ? "Cargado" : "Pendiente"}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted">
          Pose activa: <span className="font-mono text-text">{activePoseName ?? "none"}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ActionButton
          label="Validation Chin Original"
          onClick={applyValidationRightHandChinPose}
          variant="primary"
        />
        <ActionButton
          label="Validation Chin Calibrated"
          onClick={applyValidationRightHandChinCalibratedPose}
          variant="primary"
        />
        <ActionButton
          label="Validation Chin Final"
          onClick={applyValidationRightHandChinFinalPose}
          variant="primary"
        />
        <ActionButton
          label="RightForwardRaise90"
          onClick={applyRightForwardRaise90Pose}
          variant="primary"
        />
        <ActionButton
          label="BothForwardRaise90"
          onClick={applyBothForwardRaise90Pose}
          variant="primary"
        />
        <ActionButton
          label="Reset"
          onClick={() => {
            resetPose();
            resetExpressions();
          }}
        />
      </div>

      {activePoseName && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Pose activa en UI: {activePoseName}
          {activePoseName === validationRightHandChinPoseMock.name
            ? " (mock de validacion)"
            : activePoseName === validationRightHandChinCalibratedPoseMock.name
              ? " (version calibrada)"
              : activePoseName === validationRightHandChinFinalPoseMock.name
                ? " (version final)"
                : activePoseName === rightForwardRaise90PoseMock.name
                  ? " (postura atomica)"
                  : activePoseName === bothForwardRaise90PoseMock.name
                    ? " (ambos brazos al frente)"
                    : ""}
        </div>
      )}

      <details className="rounded-md border border-panel-border bg-slate-50 p-3">
        <summary className="cursor-pointer select-none text-sm font-semibold text-text">
          Debug de posiciones
        </summary>
        <div className="mt-3 space-y-2 text-xs text-muted">
          <p>
            Pose activa: <span className="font-mono text-text">{activePoseName ?? "none"}</span>
          </p>
          {ARM_CALIBRATION_MAP_ROWS.map((item) => (
            <div key={item.role}>
              <span className="font-medium text-text">{item.role}:</span>{" "}
              <span className="font-mono text-text">
                {item.config.bone}.{item.config.axis}
                {item.config.direction === "positive" ? "+" : "-"} ={" "}
                {(item.config.percent * 100).toFixed(0)}% {"->"}{" "}
                {getCalibrationRoleValue(item.config).toFixed(2)} rad
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <BoneControls />
        </div>
      </details>

      <MediaPipePoseDebugPanel />
    </div>
  );
}
