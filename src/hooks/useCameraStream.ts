"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export interface CameraStreamState {
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraReady: boolean;
  permissionDenied: boolean;
  streamActive: boolean;
  cameraError: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCameraStream(): CameraStreamState {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
    setStreamActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("getUserMedia no esta disponible en este navegador.");
      setPermissionDenied(false);
      setCameraReady(false);
      return;
    }

    setCameraError(null);
    setPermissionDenied(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        await videoRef.current.play();
      }

      setCameraReady(true);
      setStreamActive(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : "No se pudo iniciar la camara.";

      setCameraError(message);
      setPermissionDenied(
        error instanceof DOMException &&
          (error.name === "NotAllowedError" || error.name === "PermissionDeniedError"),
      );
      setCameraReady(false);
      setStreamActive(false);
    }
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  return {
    videoRef,
    cameraReady,
    permissionDenied,
    streamActive,
    cameraError,
    startCamera,
    stopCamera,
  };
}
