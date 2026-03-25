"use client";

import {
  ARM_CALIBRATION_MAP_ROWS,
  AVATAR_ARM_CALIBRATION_SUMMARY,
  AVATAR_ARM_CALIBRATION_TESTS,
  RIGHT_ARM_CALIBRATION_MAP,
} from "@/mocks/avatarCalibration.mock";
import { getCalibrationRoleValue } from "@/mocks/armCalibrationMap.mock";
import { useAvatarStore } from "@/store/avatarStore";

export function ArmCalibrationPanel() {
  const activeCalibrationTest = useAvatarStore((state) => state.activeCalibrationTest);
  const applyCalibrationTest = useAvatarStore((state) => state.applyCalibrationTest);
  const applyValidationRightHandChinCalibratedPose = useAvatarStore(
    (state) => state.applyValidationRightHandChinCalibratedPose,
  );
  const applyValidationRightHandChinFinalPose = useAvatarStore(
    (state) => state.applyValidationRightHandChinFinalPose,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Calibracion de Brazos</h3>
        <span className="text-xs text-muted">{AVATAR_ARM_CALIBRATION_TESTS.length} tests</span>
      </div>

      <p className="text-xs text-muted">
        Cada test mueve un solo hueso en un solo eje para revelar el comportamiento local real
        del rig del avatar actual.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {AVATAR_ARM_CALIBRATION_TESTS.map((test) => (
          <button
            key={test.id}
            type="button"
            onClick={() => applyCalibrationTest(test)}
            className="rounded-md border border-panel-border bg-surface px-2 py-1 text-left text-xs font-medium text-text hover:bg-slate-100"
          >
            {test.name}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={applyValidationRightHandChinCalibratedPose}
        className="w-full rounded-md border border-emerald-300 bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-200"
      >
        Aplicar validation-right-hand-chin calibrada
      </button>

      <button
        type="button"
        onClick={applyValidationRightHandChinFinalPose}
        className="w-full rounded-md border border-cyan-300 bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-900 hover:bg-cyan-200"
      >
        Aplicar validation-right-hand-chin final
      </button>

      {activeCalibrationTest && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs space-y-1">
          <div className="font-mono font-semibold text-amber-900">
            Test activo: {activeCalibrationTest.name}
          </div>
          <div className="text-amber-800">Hueso: {activeCalibrationTest.bone}</div>
          <div className="text-amber-800">Eje: {activeCalibrationTest.axis.toUpperCase()}+</div>
          <div className="text-amber-800">
            Valor aplicado: {activeCalibrationTest.value.toFixed(2)} rad
          </div>
        </div>
      )}

      <div className="rounded-md border border-panel-border bg-slate-50 p-2 text-xs space-y-1">
        <div className="font-semibold text-text">Arm Calibration Map</div>
        {ARM_CALIBRATION_MAP_ROWS.map((item) => (
          <div key={item.role} className="text-muted">
            <span className="font-medium text-text">{item.role}:</span>{" "}
              <span className="font-mono text-text">
                {item.config.bone}.{item.config.axis}
                {item.config.direction === "positive" ? "+" : "-"} ={" "}
              {(item.config.percent * 100).toFixed(0)}% {"->"}{" "}
              {getCalibrationRoleValue(item.config).toFixed(2)} rad
            </span>{" "}
            {item.config.note}
          </div>
        ))}
        <div className="pt-1 text-muted">
          <span className="font-medium text-text">ForwardRaise documentado:</span>{" "}
          <span className="font-mono text-text">
            {RIGHT_ARM_CALIBRATION_MAP.forwardRaise.bone}.
            {RIGHT_ARM_CALIBRATION_MAP.forwardRaise.axis}
            {RIGHT_ARM_CALIBRATION_MAP.forwardRaise.direction === "positive" ? "+" : "-"} ={" "}
            {(RIGHT_ARM_CALIBRATION_MAP.forwardRaise.percent * 100).toFixed(0)}% {"->"}{" "}
            {getCalibrationRoleValue(RIGHT_ARM_CALIBRATION_MAP.forwardRaise).toFixed(2)} rad
          </span>
        </div>
      </div>

      <div className="rounded-md border border-panel-border bg-slate-50 p-2 text-xs space-y-1">
        <div className="font-semibold text-text">Resumen esperado del rig</div>
        {AVATAR_ARM_CALIBRATION_SUMMARY.map((item) => (
          <div key={item.label} className="text-muted">
            <span className="font-medium text-text">{item.label}:</span> {item.result}
          </div>
        ))}
      </div>
    </div>
  );
}
