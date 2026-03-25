/**
 * Pipeline completo: RawCapture → NormalizedCapture → AvatarFrame
 * Orquestador del flujo completo de conversión
 */

import type { RawCapture } from "@/types/capture";
import type { AvatarFrame } from "@/types/motion";
import { normalizeRawCapture } from "./normalizeRawCapture";
import { getRetargetDebugInfo, normalizedCaptureToAvatarFrame, type RetargetDebugInfo } from "./mediapipeToAvatarFrame";

/**
 * Resultado de la conversión completa
 */
export interface CaptureToFrameResult {
  frame: AvatarFrame | null;
  success: boolean;
  errors: Array<{ type: string; message: string }>;
  processingTime?: number;
  debug?: RetargetDebugInfo;
}

/**
 * Convierte una captura RAW completa a AvatarFrame
 * Encadena: normalización → adapter → frame
 */
export function captureToAvatarFrame(raw: RawCapture): CaptureToFrameResult {
  const startTime = performance.now();
  const errors: Array<{ type: string; message: string }> = [];

  try {
    // Paso 1: Normalizar captura
    const normResult = normalizeRawCapture(raw);
    if (!normResult.capture) {
      return {
        frame: null,
        success: false,
        errors: normResult.errors.map((e) => ({
          type: e.type,
          message: e.message,
        })),
        processingTime: performance.now() - startTime,
      };
    }

    // Paso 2: Convertir a AvatarFrame
    const frame = normalizedCaptureToAvatarFrame(normResult.capture);
    const debug = getRetargetDebugInfo(normResult.capture);

    return {
      frame,
      success: true,
      errors,
      processingTime: performance.now() - startTime,
      debug,
    };
  } catch (error) {
    errors.push({
      type: "pipeline_error",
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      frame: null,
      success: false,
      errors,
      processingTime: performance.now() - startTime,
    };
  }
}

/**
 * Procesa múltiples capturas en lote (útil para reproducción de clips)
 */
export function captureSequenceToFrameSequence(
  captures: RawCapture[],
): Array<CaptureToFrameResult> {
  return captures.map((capture) => captureToAvatarFrame(capture));
}
