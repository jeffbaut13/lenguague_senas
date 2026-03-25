/**
 * Store de captura: gestión de datos crudos de cámara/MediaPipe
 * Para testing sin cámara en vivo
 */

import { create } from "zustand";
import type { RawCapture, NormalizedCapture, NormalizationResult } from "@/types/capture";
import type { AvatarFrame } from "@/types/motion";
import {
  createNeutralRawCapture,
  createGreetingRawCapture,
  createYesNodRawCapture,
  createNoHeadShakeRawCapture,
  createSelfReferenceRawCapture,
  createHandsUpRawCapture,
} from "@/mocks/rawCapture.mock";
import { normalizeRawCapture } from "@/lib/adapters/normalizeRawCapture";
import { captureToAvatarFrame } from "@/lib/adapters/captureToAvatarFrame";
import type { RetargetDebugInfo } from "@/lib/adapters/mediapipeToAvatarFrame";

interface CaptureStoreState {
  // Datos crudos
  currentRawCapture: RawCapture | null;
  captureHistory: RawCapture[];

  // Datos normalizados
  currentNormalizedCapture: NormalizedCapture | null;
  normalizedHistory: NormalizedCapture[]; // Solo items válidos, no null

  // Frames convertidos
  currentAvatarFrame: AvatarFrame | null;
  frameHistory: AvatarFrame[]; // Solo items válidos, no null
  currentRetargetDebug: RetargetDebugInfo | null;

  // Errores y estado
  lastErrors: Array<{ type: string; message: string }>;
  isCapturing: boolean;

  // Métodos
  captureFrame: (source: "neutral" | "greeting" | "yes" | "no" | "self" | "hands_up") => void;
  ingestRawCapture: (capture: RawCapture) => void;
  normalizeCurrentCapture: () => NormalizationResult | null;
  convertToAvatarFrame: () => void;
  setRawCapture: (capture: RawCapture) => void;
  clearHistory: () => void;
  playbackCaptures: (captures: RawCapture[]) => void;
}

export const useCaptureStore = create<CaptureStoreState>((set, get) => ({
  currentRawCapture: null,
  captureHistory: [],
  currentNormalizedCapture: null,
  normalizedHistory: [],
  currentAvatarFrame: null,
  frameHistory: [],
  currentRetargetDebug: null,
  lastErrors: [],
  isCapturing: false,

  captureFrame: (source) => {
    let capture: RawCapture;

    switch (source) {
      case "greeting":
        capture = createGreetingRawCapture();
        break;
      case "yes":
        capture = createYesNodRawCapture(0);
        break;
      case "no":
        capture = createNoHeadShakeRawCapture(0);
        break;
      case "self":
        capture = createSelfReferenceRawCapture();
        break;
      case "hands_up":
        capture = createHandsUpRawCapture();
        break;
      case "neutral":
      default:
        capture = createNeutralRawCapture();
    }

    set((state) => ({
      currentRawCapture: capture,
      captureHistory: [...state.captureHistory, capture],
    }));

    // Convertir inmediatamente
    get().normalizeCurrentCapture();
    get().convertToAvatarFrame();
  },

  ingestRawCapture: (capture) => {
    set((state) => ({
      currentRawCapture: capture,
      captureHistory: [...state.captureHistory, capture],
    }));

    get().normalizeCurrentCapture();
    get().convertToAvatarFrame();
  },

  normalizeCurrentCapture: () => {
    const { currentRawCapture } = get();
    if (!currentRawCapture) {
      set({ lastErrors: [{ type: "error", message: "No raw capture to normalize" }] });
      return null;
    }

    const result = normalizeRawCapture(currentRawCapture);
    if (result.capture) {
      set((state) => {
        const newErrors: Array<{ type: string; message: string }> = result.errors.map((e) => ({
          type: e.type,
          message: e.message,
        }));

        const newCapture = result.capture as NormalizedCapture;
        return {
          currentNormalizedCapture: newCapture,
          normalizedHistory: [...state.normalizedHistory, newCapture],
          lastErrors: newErrors,
        };
      });
    }

    return result;
  },

  convertToAvatarFrame: () => {
    const { currentRawCapture } = get();
    if (!currentRawCapture) return;

    const result = captureToAvatarFrame(currentRawCapture);
    if (result.frame) {
      set((state) => {
        const newFrame = result.frame as AvatarFrame;
        return {
          currentAvatarFrame: newFrame,
          frameHistory: [...state.frameHistory, newFrame],
          currentRetargetDebug: result.debug ?? null,
          lastErrors: result.errors,
        };
      });
    }
  },

  setRawCapture: (capture) => {
    set({ currentRawCapture: capture });
  },

  clearHistory: () => {
    set({
      currentRawCapture: null,
      captureHistory: [],
      currentNormalizedCapture: null,
      normalizedHistory: [],
      currentAvatarFrame: null,
      frameHistory: [],
      currentRetargetDebug: null,
      lastErrors: [],
    });
  },

  playbackCaptures: (captures) => {
    set({
      captureHistory: captures,
      frameHistory: captures
        .map((c) => captureToAvatarFrame(c).frame)
        .filter((f) => f !== null) as AvatarFrame[],
    });
  },
}));
