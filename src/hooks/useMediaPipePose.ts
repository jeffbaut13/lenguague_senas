"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import type { RawCapture } from "@/types/capture";
import { poseLandmarkerToRawCapture } from "@/lib/adapters/poseLandmarkerToRawCapture";

const MEDIAPIPE_WASM_URL = "/mediapipe/wasm";
const POSE_MODEL_URL = "/mediapipe/pose_landmarker_lite.task";
const INIT_TIMEOUT_MS = 15000;

type MediaPipeInitStage =
  | "idle"
  | "loading_wasm"
  | "loading_model_fetch"
  | "loading_model_create"
  | "loading_model_config"
  | "ready";

export interface MediaPipePoseHookState {
  mediaPipeReady: boolean;
  mediaPipeInitializing: boolean;
  initStage: MediaPipeInitStage;
  mediaPipeError: string | null;
  modelFetchOk: boolean;
  modelBytes: number;
  fps: number;
  poseDetected: boolean;
  landmarksDetected: number;
  confidence: number;
  frameSkipped: boolean;
  staleFrame: boolean;
  latestRawCapture: RawCapture | null;
  latestResult: PoseLandmarkerResult | null;
  wasmUrl: string;
  modelUrl: string;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function fetchModelBuffer(modelUrl: string): Promise<Uint8Array> {
  const response = await fetch(modelUrl, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`model fetch failed with ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

export function useMediaPipePose(args: {
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  mirrorInput: boolean;
}): MediaPipePoseHookState {
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const initializingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const lastProcessedTimestampRef = useRef(0);
  const fpsWindowRef = useRef<{ startedAt: number; frames: number }>({
    startedAt: 0,
    frames: 0,
  });

  const [mediaPipeReady, setMediaPipeReady] = useState(false);
  const [mediaPipeInitializing, setMediaPipeInitializing] = useState(false);
  const [initStage, setInitStage] = useState<MediaPipeInitStage>("idle");
  const [mediaPipeError, setMediaPipeError] = useState<string | null>(null);
  const [modelFetchOk, setModelFetchOk] = useState(false);
  const [modelBytes, setModelBytes] = useState(0);
  const [fps, setFps] = useState(0);
  const [poseDetected, setPoseDetected] = useState(false);
  const [landmarksDetected, setLandmarksDetected] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [frameSkipped, setFrameSkipped] = useState(false);
  const [staleFrame, setStaleFrame] = useState(false);
  const [latestRawCapture, setLatestRawCapture] = useState<RawCapture | null>(null);
  const [latestResult, setLatestResult] = useState<PoseLandmarkerResult | null>(null);

  useEffect(() => {
    if (!args.enabled) {
      return;
    }

    const originalConsoleError = console.error;

    console.error = (...args: unknown[]) => {
      const joined = args
        .map((arg) => (typeof arg === "string" ? arg : ""))
        .join(" ");

      if (joined.includes("Created TensorFlow Lite XNNPACK delegate for CPU")) {
        return;
      }

      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, [args.enabled]);

  useEffect(() => {
    let cancelled = false;

    async function ensureLandmarker() {
      if (!args.enabled || landmarkerRef.current || initializingRef.current) {
        return;
      }

      initializingRef.current = true;
      let currentStage: MediaPipeInitStage = "loading_wasm";
      setMediaPipeInitializing(true);
      setInitStage(currentStage);
      setMediaPipeError(null);
      setModelFetchOk(false);
      setModelBytes(0);

      try {
        const fileset = await withTimeout(
          FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL),
          INIT_TIMEOUT_MS,
          "MediaPipe WASM load",
        );
        if (cancelled) {
          return;
        }

        currentStage = "loading_model_fetch";
        setInitStage(currentStage);

        const modelBuffer = await withTimeout(
          fetchModelBuffer(POSE_MODEL_URL),
          INIT_TIMEOUT_MS,
          "MediaPipe model fetch",
        );

        if (cancelled) {
          return;
        }

        setModelFetchOk(true);
        setModelBytes(modelBuffer.byteLength);

        currentStage = "loading_model_create";
        setInitStage(currentStage);

        landmarkerRef.current = await withTimeout(
          PoseLandmarker.createFromOptions(fileset, {
            baseOptions: {
              modelAssetBuffer: modelBuffer,
            },
            runningMode: "VIDEO",
            numPoses: 1,
            minPoseDetectionConfidence: 0.35,
            minPosePresenceConfidence: 0.35,
            minTrackingConfidence: 0.35,
            outputSegmentationMasks: false,
          }),
          INIT_TIMEOUT_MS,
          "MediaPipe model create",
        );

        if (cancelled) {
          return;
        }

        setMediaPipeReady(true);
        setInitStage("ready");
      } catch (error) {
        setMediaPipeError(
          error instanceof Error
            ? `MediaPipe init failed during ${currentStage}: ${error.message}`
            : "MediaPipe init failed: unknown error",
        );
        setMediaPipeReady(false);
        setInitStage("idle");
      } finally {
        initializingRef.current = false;
        if (!cancelled) {
          setMediaPipeInitializing(false);
        }
      }
    }

    void ensureLandmarker();

    return () => {
      cancelled = true;
    };
  }, [args.enabled]);

  useEffect(() => {
    if (!args.enabled || !mediaPipeReady || !landmarkerRef.current) {
      return;
    }

    const tick = () => {
      const video = args.videoRef.current;
      const landmarker = landmarkerRef.current;

      if (!video || !landmarker || video.readyState < 2) {
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      if (video.currentTime === lastVideoTimeRef.current) {
        setFrameSkipped(true);
        setStaleFrame(
          lastProcessedTimestampRef.current > 0 &&
            performance.now() - lastProcessedTimestampRef.current > 1000,
        );
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      setFrameSkipped(false);
      setStaleFrame(false);
      lastVideoTimeRef.current = video.currentTime;

      try {
        const timestampMs = performance.now();
        lastProcessedTimestampRef.current = timestampMs;
        const result = landmarker.detectForVideo(video, timestampMs);
        setLatestResult(result);

        const rawCapture = poseLandmarkerToRawCapture({
          result,
          timestampMs,
          mirrored: args.mirrorInput,
          source: "mediapipe",
        });

        const poseLandmarks = result.landmarks[0] ?? [];
        const avgConfidence =
          poseLandmarks.length > 0
            ? poseLandmarks.reduce((sum, landmark) => sum + (landmark.visibility ?? 0), 0) /
              poseLandmarks.length
            : 0;

        setPoseDetected(Boolean(rawCapture));
        setLandmarksDetected(poseLandmarks.length);
        setConfidence(avgConfidence);
        setLatestRawCapture(rawCapture);

        const windowState = fpsWindowRef.current;
        if (windowState.startedAt === 0) {
          windowState.startedAt = timestampMs;
        }
        windowState.frames += 1;
        const elapsed = timestampMs - windowState.startedAt;
        if (elapsed >= 1000) {
          setFps((windowState.frames * 1000) / elapsed);
          fpsWindowRef.current = {
            startedAt: timestampMs,
            frames: 0,
          };
        }
      } catch (error) {
        setMediaPipeError(
          error instanceof Error
            ? `Pose detect failed: ${error.message}`
            : "Pose detect failed: unknown error",
        );
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [args.enabled, args.mirrorInput, args.videoRef, mediaPipeReady]);

  useEffect(() => {
    if (args.enabled) {
      return;
    }

    setInitStage("idle");
    setMediaPipeReady(false);
    setModelFetchOk(false);
    setModelBytes(0);

    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [args.enabled]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  return {
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
    latestResult,
    wasmUrl: MEDIAPIPE_WASM_URL,
    modelUrl: POSE_MODEL_URL,
  };
}
