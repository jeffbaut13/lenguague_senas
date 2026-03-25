"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCameraStream } from "@/hooks/useCameraStream";
import { useMediaPipePose } from "@/hooks/useMediaPipePose";
import { useMediaPipeFace } from "@/hooks/useMediaPipeFace";
import { useMediaPipeHands } from "@/hooks/useMediaPipeHands";
import { smoothAvatarFrame } from "@/lib/animation/smoothAvatarFrame";
import { useAvatarStore } from "@/store/avatarStore";
import { useCaptureStore } from "@/store/captureStore";
import type { AvatarFrame } from "@/types/motion";

type DiagnosticItem = {
  severity: "warning" | "error";
  type: string;
  message: string;
};

function ToggleRow(props: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-panel-border bg-surface px-3 py-2 text-xs text-text">
      <span>{props.label}</span>
      <input
        type="checkbox"
        checked={props.checked}
        onChange={(event) => props.onChange(event.currentTarget.checked)}
      />
    </label>
  );
}

function formatVec3(
  value: { x: number; y: number; z: number } | null | undefined,
): string {
  if (!value) {
    return "n/a";
  }

  return `x:${value.x.toFixed(3)} y:${value.y.toFixed(3)} z:${value.z.toFixed(3)}`;
}

function sampleObject(value: unknown, maxLength = 800): string {
  const text = JSON.stringify(value, null, 2) ?? "null";
  return text.length > maxLength ? `${text.slice(0, maxLength)}\n...` : text;
}

export function MediaPipePoseDebugPanel() {
	  const [controls, setControls] = useState({
    enableCamera: false,
    enableMediaPipePose: false,
    applyPoseToAvatar: true,
    freezeLastFrame: false,
    showDebugData: true,
    mirrorCameraInput: true,
    useSmoothing: true,
    fallbackToMockWhenNoPose: false,
	  });
	  const [assetProbe, setAssetProbe] = useState<{
	    status: "idle" | "loading" | "ok" | "error";
	    message: string;
	  }>({
	    status: "idle",
	    message: "Sin probar",
	  });

  const {
    videoRef,
    cameraReady,
    permissionDenied,
    streamActive,
    cameraError,
    startCamera,
    stopCamera,
  } = useCameraStream();
	  const {
	    mediaPipeReady,
	    mediaPipeInitializing,
	    initStage,
	    mediaPipeError,
	    modelFetchOk,
	    modelBytes,
	    fps,
	    poseDetected,
	    landmarksDetected,
	    confidence,
	    frameSkipped,
	    staleFrame,
	    latestRawCapture,
	    wasmUrl,
	    modelUrl,
	  } = useMediaPipePose({
    videoRef,
    enabled:
      controls.enableCamera && controls.enableMediaPipePose && streamActive,
    mirrorInput: controls.mirrorCameraInput,
  });

  const applyAvatarFrame = useAvatarStore((state) => state.applyAvatarFrame);
  const applyMockFrame = useAvatarStore((state) => state.applyMockFrame);

  const currentRawCapture = useCaptureStore((state) => state.currentRawCapture);
  const currentNormalizedCapture = useCaptureStore(
    (state) => state.currentNormalizedCapture,
  );
  const currentAvatarFrame = useCaptureStore((state) => state.currentAvatarFrame);
  const currentRetargetDebug = useCaptureStore((state) => state.currentRetargetDebug);
  const pipelineErrors = useCaptureStore((state) => state.lastErrors);

  const lastAppliedFrameRef = useRef<AvatarFrame | null>(null);
  const lastSuccessfulPoseRef = useRef(false);

  useEffect(() => {
    if (!controls.enableCamera) {
      stopCamera();
    }
  }, [controls.enableCamera, stopCamera]);

  const diagnostics = useMemo(() => {
    const nextDiagnostics: DiagnosticItem[] = [];

    if (permissionDenied) {
      nextDiagnostics.push({
        severity: "error",
        type: "camera_permission",
        message: "No camera permission",
      });
    }

    if (cameraError) {
      nextDiagnostics.push({
        severity: "error",
        type: "camera_error",
        message: cameraError,
      });
    }

    if (mediaPipeError) {
      nextDiagnostics.push({
        severity: "error",
        type: "mediapipe_init_failed",
        message: mediaPipeError,
      });
    }

	    if (
	      controls.enableMediaPipePose &&
	      controls.enableCamera &&
	      streamActive &&
	      cameraReady &&
	      mediaPipeReady &&
	      !mediaPipeInitializing &&
	      !mediaPipeError &&
	      !poseDetected
	    ) {
	      nextDiagnostics.push({
	        severity: "warning",
	        type: "pose_not_detected",
	        message:
	          "Pose not detected in current frame. Prueba alejandote un poco, mostrando hombros y torso completos, y mejorando iluminacion.",
	      });
	    }

    if (confidence > 0 && confidence < 0.5) {
      nextDiagnostics.push({
        severity: "warning",
        type: "low_confidence",
        message: `Low confidence: ${confidence.toFixed(2)}`,
      });
    }

    if (frameSkipped) {
      nextDiagnostics.push({
        severity: "warning",
        type: "frame_skipped",
        message: "Frame skipped because video time did not advance",
      });
    }

    pipelineErrors.forEach((item) => {
      nextDiagnostics.push({
        severity: "error",
        type: item.type,
        message: item.message,
      });
    });

    currentRetargetDebug?.warnings.forEach((warning) => {
      nextDiagnostics.push({
        severity: "warning",
        type: "retarget_warning",
        message: warning,
      });
    });

    if (staleFrame) {
      nextDiagnostics.push({
        severity: "warning",
        type: "stale_frame",
        message: "Stale frame",
      });
    }

    if (currentAvatarFrame) {
      const invalidRotation = Object.values(currentAvatarFrame.bones).some(
        (bone) =>
          bone &&
          (!Number.isFinite(bone.rotation.x) ||
            !Number.isFinite(bone.rotation.y) ||
            !Number.isFinite(bone.rotation.z)),
      );

      if (invalidRotation) {
        nextDiagnostics.push({
          severity: "error",
          type: "invalid_rotation",
          message: "NaN / invalid rotation",
        });
      }
    }

    return nextDiagnostics;
  }, [
    cameraError,
    confidence,
	    controls.enableMediaPipePose,
	    controls.enableCamera,
	    streamActive,
	    cameraReady,
	    currentAvatarFrame,
	    currentRetargetDebug,
	    frameSkipped,
	    staleFrame,
	    pipelineErrors,
	    mediaPipeError,
	    mediaPipeInitializing,
	    mediaPipeReady,
	    permissionDenied,
	    poseDetected,
	  ]);

  useEffect(() => {
    if (!latestRawCapture) {
      if (
        controls.applyPoseToAvatar &&
        controls.fallbackToMockWhenNoPose &&
        lastSuccessfulPoseRef.current
      ) {
        applyMockFrame();
        lastSuccessfulPoseRef.current = false;
      }
      return;
    }

    const captureStore = useCaptureStore.getState();
    captureStore.ingestRawCapture(latestRawCapture);

    const {
      currentAvatarFrame: latestAvatarFrame,
    } = useCaptureStore.getState();

    if (!latestAvatarFrame) {
      if (controls.applyPoseToAvatar && controls.fallbackToMockWhenNoPose) {
        applyMockFrame();
      }
      lastSuccessfulPoseRef.current = false;
      return;
    }

    lastSuccessfulPoseRef.current = true;

    const finalFrame =
      controls.useSmoothing
        ? smoothAvatarFrame(lastAppliedFrameRef.current, latestAvatarFrame, 0.35)
        : latestAvatarFrame;

    lastAppliedFrameRef.current = finalFrame;

    if (controls.applyPoseToAvatar && !controls.freezeLastFrame) {
      applyAvatarFrame(finalFrame, "mediapipe-pose-live", "mediapipe-pose-live");
    }
  }, [
    applyAvatarFrame,
    applyMockFrame,
    controls.applyPoseToAvatar,
    controls.fallbackToMockWhenNoPose,
    controls.freezeLastFrame,
    controls.useSmoothing,
    latestRawCapture,
  ]);

  const poseLandmarksPreview = useMemo(() => {
    return currentRawCapture?.poseLandmarks.slice(0, 5) ?? [];
  }, [currentRawCapture]);

  const framePreview = useMemo(() => {
    if (!currentAvatarFrame) {
      return null;
    }

    return {
      timestampMs: currentAvatarFrame.timestampMs,
      bones: Object.fromEntries(Object.entries(currentAvatarFrame.bones).slice(0, 6)),
      expressions: currentAvatarFrame.expressions,
    };
  }, [currentAvatarFrame]);

	  const handsStub = useMediaPipeHands();
	  const faceStub = useMediaPipeFace();

	  async function probeModelAsset() {
	    setAssetProbe({
	      status: "loading",
	      message: "Probando fetch del modelo...",
	    });

	    try {
	      const response = await fetch(modelUrl, {
	        method: "GET",
	        cache: "no-store",
	      });

	      if (!response.ok) {
	        setAssetProbe({
	          status: "error",
	          message: `HTTP ${response.status} ${response.statusText}`,
	        });
	        return;
	      }

	      const buffer = await response.arrayBuffer();
	      setAssetProbe({
	        status: "ok",
	        message: `${buffer.byteLength} bytes recibidos`,
	      });
	    } catch (error) {
	      setAssetProbe({
	        status: "error",
	        message: error instanceof Error ? error.message : "Fetch fallo",
	      });
	    }
	  }

  return (
    <section className="space-y-3 rounded-md border border-panel-border bg-surface p-3">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text">
          MediaPipe Pose Debug
        </h2>
        <p className="text-xs text-muted">
          Integracion progresiva de camara + Pose sobre el pipeline actual. Hands y Face
          siguen desactivados.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ToggleRow
          label="Enable Camera"
          checked={controls.enableCamera}
          onChange={(checked) =>
            setControls((state) => ({ ...state, enableCamera: checked }))
          }
        />
        <ToggleRow
          label="Enable MediaPipe Pose"
          checked={controls.enableMediaPipePose}
          onChange={(checked) =>
            setControls((state) => ({ ...state, enableMediaPipePose: checked }))
          }
        />
        <ToggleRow
          label="Apply Pose To Avatar"
          checked={controls.applyPoseToAvatar}
          onChange={(checked) =>
            setControls((state) => ({ ...state, applyPoseToAvatar: checked }))
          }
        />
        <ToggleRow
          label="Freeze Last Frame"
          checked={controls.freezeLastFrame}
          onChange={(checked) =>
            setControls((state) => ({ ...state, freezeLastFrame: checked }))
          }
        />
        <ToggleRow
          label="Show Debug Data"
          checked={controls.showDebugData}
          onChange={(checked) =>
            setControls((state) => ({ ...state, showDebugData: checked }))
          }
        />
        <ToggleRow
          label="Mirror Camera Input"
          checked={controls.mirrorCameraInput}
          onChange={(checked) =>
            setControls((state) => ({ ...state, mirrorCameraInput: checked }))
          }
        />
        <ToggleRow
          label="Use Smoothing"
          checked={controls.useSmoothing}
          onChange={(checked) =>
            setControls((state) => ({ ...state, useSmoothing: checked }))
          }
        />
        <ToggleRow
          label="Fallback To Mock When No Pose"
          checked={controls.fallbackToMockWhenNoPose}
          onChange={(checked) =>
            setControls((state) => ({ ...state, fallbackToMockWhenNoPose: checked }))
          }
        />
      </div>

	      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setControls((state) => ({ ...state, enableCamera: true }));
            void startCamera();
          }}
          className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white"
        >
          Start Camera
        </button>
	        <button
	          type="button"
	          onClick={() => {
	            setControls((state) => ({ ...state, enableCamera: false }));
	            stopCamera();
          }}
          className="rounded-md border border-panel-border bg-surface px-3 py-2 text-xs font-medium text-text"
	        >
	          Stop Camera
	        </button>
	      </div>

	      <button
	        type="button"
	        onClick={() => {
	          void probeModelAsset();
	        }}
	        className="w-full rounded-md border border-panel-border bg-surface px-3 py-2 text-xs font-medium text-text"
	      >
	        Test Model Fetch
	      </button>

      <div className="rounded-md border border-panel-border bg-slate-50 p-2 text-xs space-y-1">
        <div className="text-muted">cameraReady: {cameraReady ? "true" : "false"}</div>
        <div className="text-muted">
          permissionDenied: {permissionDenied ? "true" : "false"}
        </div>
        <div className="text-muted">streamActive: {streamActive ? "true" : "false"}</div>
        <div className="text-muted">
          mediaPipeReady: {mediaPipeReady ? "true" : "false"}
        </div>
	        <div className="text-muted">
	          mediaPipeInitializing: {mediaPipeInitializing ? "true" : "false"}
	        </div>
	        <div className="text-muted">initStage: {initStage}</div>
	        <div className="text-muted">modelFetchOk: {modelFetchOk ? "true" : "false"}</div>
	        <div className="text-muted">modelBytes: {modelBytes}</div>
	        <div className="text-muted">fps: {fps.toFixed(1)}</div>
	        <div className="text-muted">landmarks: {landmarksDetected}</div>
	        <div className="text-muted">confidence: {confidence.toFixed(2)}</div>
        <div className="text-muted">
          mirrored: {controls.mirrorCameraInput ? "true" : "false"}
        </div>
	        <div className="text-muted">
	          hands stub: {handsStub.status} | face stub: {faceStub.status}
	        </div>
	        <div className="text-muted break-all">wasmUrl: {wasmUrl}</div>
	        <div className="text-muted break-all">modelUrl: {modelUrl}</div>
	        <div className="text-muted">
	          assetProbe: {assetProbe.status} | {assetProbe.message}
	        </div>
	      </div>

      <div className="rounded-md border border-panel-border bg-slate-100 p-2">
        <video
          ref={videoRef}
          className="w-full rounded-md bg-black"
          style={{ transform: controls.mirrorCameraInput ? "scaleX(-1)" : "none" }}
          autoPlay
          muted
          playsInline
        />
      </div>

      {diagnostics.length > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs space-y-1">
          <div className="font-semibold text-red-800">Errores / Warnings</div>
          {diagnostics.map((item, index) => (
            <div
              key={`${item.type}-${index}`}
              className={item.severity === "error" ? "text-red-700" : "text-amber-700"}
            >
              [{item.severity}] {item.type}: {item.message}
            </div>
          ))}
        </div>
      )}

      {controls.showDebugData && (
        <div className="space-y-2">
          <details className="rounded-md border border-panel-border bg-slate-50 p-2" open>
            <summary className="cursor-pointer text-xs font-semibold text-text">
              RawCapture real
            </summary>
            <pre className="mt-2 overflow-auto text-[11px] text-muted">
              {sampleObject({
                timestampMs: currentRawCapture?.timestampMs ?? null,
                source: currentRawCapture?.source ?? null,
                confidence: currentRawCapture?.confidence ?? null,
                landmarksDetected: currentRawCapture?.poseLandmarks.length ?? 0,
                sample: poseLandmarksPreview,
              })}
            </pre>
          </details>

          <details className="rounded-md border border-panel-border bg-slate-50 p-2">
            <summary className="cursor-pointer text-xs font-semibold text-text">
              NormalizedCapture
            </summary>
            <pre className="mt-2 overflow-auto text-[11px] text-muted">
              {sampleObject(currentNormalizedCapture)}
            </pre>
          </details>

          <details className="rounded-md border border-panel-border bg-slate-50 p-2">
            <summary className="cursor-pointer text-xs font-semibold text-text">
              Retarget Debug
            </summary>
            <div className="mt-2 space-y-1 text-[11px] text-muted">
              <div>shoulderAxis: {formatVec3(currentRetargetDebug?.shoulderAxis)}</div>
              <div>upAxis: {formatVec3(currentRetargetDebug?.upAxis)}</div>
              <div>forwardAxis: {formatVec3(currentRetargetDebug?.forwardAxis)}</div>
	              <div>poseConfidence: {currentRetargetDebug?.poseConfidence?.toFixed(2) ?? "n/a"}</div>
	              <div>resolved intents: {currentRetargetDebug?.resolvedIntents.length ?? 0}</div>
	              <div>
	                resolved percents: {currentRetargetDebug?.resolvedAxisPercents.length ?? 0}
	              </div>
	              <div>
	                calibration signals: {currentRetargetDebug?.calibrationSignals.length ?? 0}
	              </div>
	              <pre className="overflow-auto text-[11px] text-muted">
	                {sampleObject({
	                  calibrationSignals: currentRetargetDebug?.calibrationSignals ?? [],
	                  resolvedIntents: currentRetargetDebug?.resolvedIntents ?? [],
	                  resolvedAxisPercents: currentRetargetDebug?.resolvedAxisPercents ?? [],
	                })}
	              </pre>
	            </div>
          </details>

          <details className="rounded-md border border-panel-border bg-slate-50 p-2">
            <summary className="cursor-pointer text-xs font-semibold text-text">
              AvatarFrame final
            </summary>
            <pre className="mt-2 overflow-auto text-[11px] text-muted">
              {sampleObject(framePreview)}
            </pre>
          </details>
        </div>
      )}
    </section>
  );
}
