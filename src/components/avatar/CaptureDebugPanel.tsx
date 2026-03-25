"use client";

/**
 * Componente: Panel de captura mockeada
 * Simula captura de MediaPipe para testing
 */

import { useCaptureStore } from "@/store/captureStore";
import { useAvatarStore } from "@/store/avatarStore";

export function CaptureDebugPanel() {
  const captureFrame = useCaptureStore((state) => state.captureFrame);
  const currentRawCapture = useCaptureStore((state) => state.currentRawCapture);
  const currentNormalizedCapture = useCaptureStore((state) => state.currentNormalizedCapture);
  const currentAvatarFrame = useCaptureStore((state) => state.currentAvatarFrame);
  const currentRetargetDebug = useCaptureStore((state) => state.currentRetargetDebug);
  const lastErrors = useCaptureStore((state) => state.lastErrors);

  const applyAvatarFrame = useAvatarStore((state) => state.applyAvatarFrame);
  const resetPose = useAvatarStore((state) => state.resetPose);
  const resetExpressions = useAvatarStore((state) => state.resetExpressions);

  const formatAxis = (axis: { x: number; y: number; z: number } | null) => {
    if (!axis) return "n/a";
    return `x:${axis.x.toFixed(3)} y:${axis.y.toFixed(3)} z:${axis.z.toFixed(3)}`;
  };

  const handleCaptureAndApply = (source: "greeting" | "yes" | "no" | "self" | "hands_up" | "neutral") => {
    if (source === "neutral") {
      // Neutro debe volver a bind/base pose sin pasar por landmarks mock.
      resetPose();
      resetExpressions();
      return;
    }

    captureFrame(source);
    const frame = useCaptureStore.getState().currentAvatarFrame;
    if (frame) {
      applyAvatarFrame(frame, "mock-json");
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text">Captura Mockeada (MediaPipe)</h3>

      {/* Botones de captura */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => handleCaptureAndApply("neutral")}
          className="rounded-md border border-panel-border bg-surface px-2 py-1 text-xs font-medium text-text hover:bg-slate-100"
        >
          Neutro
        </button>
        <button
          type="button"
          onClick={() => handleCaptureAndApply("greeting")}
          className="rounded-md border border-panel-border bg-surface px-2 py-1 text-xs font-medium text-text hover:bg-slate-100"
        >
          Saludo
        </button>
        <button
          type="button"
          onClick={() => handleCaptureAndApply("yes")}
          className="rounded-md border border-panel-border bg-surface px-2 py-1 text-xs font-medium text-text hover:bg-slate-100"
        >
          Sí
        </button>
        <button
          type="button"
          onClick={() => handleCaptureAndApply("no")}
          className="rounded-md border border-panel-border bg-surface px-2 py-1 text-xs font-medium text-text hover:bg-slate-100"
        >
          No
        </button>
        <button
          type="button"
          onClick={() => handleCaptureAndApply("self")}
          className="rounded-md border border-panel-border bg-surface px-2 py-1 text-xs font-medium text-text hover:bg-slate-100"
        >
          Yo
        </button>
        <button
          type="button"
          onClick={() => handleCaptureAndApply("hands_up")}
          className="rounded-md border border-panel-border bg-surface px-2 py-1 text-xs font-medium text-text hover:bg-slate-100"
        >
          Manos ↑
        </button>
      </div>

      {/* Info de captura */}
      {currentRawCapture && (
        <div className="rounded-md border border-panel-border bg-slate-50 p-2 text-xs space-y-1">
          <div className="font-mono font-semibold text-text">Raw Capture</div>
          <div className="text-muted">Timestamp: {currentRawCapture.timestampMs}ms</div>
          <div className="text-muted">
            Pose: {currentRawCapture.poseLandmarks.length} landmarks
          </div>
          <div className="text-muted">
            Manos: L={currentRawCapture.leftHandLandmarks?.length ?? 0}, R=
            {currentRawCapture.rightHandLandmarks?.length ?? 0}
          </div>
          <div className="text-muted">Fuente: {currentRawCapture.source}</div>
        </div>
      )}

      {currentNormalizedCapture && (
        <div className="rounded-md border border-panel-border bg-slate-50 p-2 text-xs space-y-1">
          <div className="font-mono font-semibold text-text">Normalized Capture</div>
          <div className="text-muted">
            Pose confidence: {currentNormalizedCapture.pose.confidence.toFixed(2)}
          </div>
          <div className="text-muted">
            Valida: {currentNormalizedCapture.isValid ? "sí" : "no"}
          </div>
        </div>
      )}

      {/* Info de frame convertido */}
      {currentAvatarFrame && (
        <div className="rounded-md border border-panel-border bg-slate-50 p-2 text-xs space-y-1">
          <div className="font-mono font-semibold text-text">Avatar Frame</div>
          <div className="text-muted">
            Huesos: {Object.keys(currentAvatarFrame.bones).length}
          </div>
          <div className="text-muted">
            Expresiones: {Object.keys(currentAvatarFrame.expressions).length}
          </div>
        </div>
      )}

      {currentRetargetDebug && (
        <div className="rounded-md border border-panel-border bg-slate-50 p-2 text-xs space-y-1">
          <div className="font-mono font-semibold text-text">Retarget Debug</div>
          <div className="text-muted">shoulderAxis: {formatAxis(currentRetargetDebug.shoulderAxis)}</div>
          <div className="text-muted">upAxis: {formatAxis(currentRetargetDebug.upAxis)}</div>
          <div className="text-muted">forwardAxis: {formatAxis(currentRetargetDebug.forwardAxis)}</div>
          <div className="text-muted">mirrored: {currentRetargetDebug.mirrored ? "true" : "false"}</div>
          <div className="text-muted">
            incremental head: {Object.keys(currentRetargetDebug.incrementalValidation.headOnly).length} huesos
          </div>
          <div className="text-muted">
            incremental chest: {Object.keys(currentRetargetDebug.incrementalValidation.chestOnly).length} huesos
          </div>
          <div className="text-muted">
            incremental rightUpperArm: {Object.keys(currentRetargetDebug.incrementalValidation.rightUpperArmOnly).length} huesos
          </div>
          <div className="text-muted">
            incremental torso+arm: {Object.keys(currentRetargetDebug.incrementalValidation.torsoAndRightUpperArm).length} huesos
          </div>
        </div>
      )}

      {/* Errores */}
      {lastErrors.length > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          <div className="font-semibold">Errores de conversión:</div>
          {lastErrors.map((err, i) => (
            <div key={i} className="mt-1">
              {err.type}: {err.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
