/**
 * Normalizer: Convierte RawCapture a NormalizedCapture
 * Limpia, valida y ajusta coordenadas
 */

import type {
  RawCapture,
  NormalizedCapture,
  NormalizationResult,
  Landmark,
} from "@/types/capture";

/**
 * Valida y normaliza un landmark
 */
function normalizeLandmark(landmark: Landmark): Landmark | null {
  // Validar coordenadas
  if (
    !Number.isFinite(landmark.x) ||
    !Number.isFinite(landmark.y) ||
    !Number.isFinite(landmark.z)
  ) {
    return null;
  }

  // Clampear confianza
  const confidence = landmark.confidence ?? 0.5;
  if (confidence < 0.3) {
    // Muy baja confianza, descartar
    return null;
  }

  // Ajustar coordenadas si están muy fuera de rango
  // MediaPipe usa coordenadas normalizadas (0-1) para imagen, pero z puede ser cualquiera
  return {
    ...landmark,
    confidence: Math.min(1, Math.max(0, confidence)),
    visibility: landmark.visibility ?? confidence,
  };
}

function normalizePoseLandmark(landmark: Landmark): Landmark | null {
  if (
    !Number.isFinite(landmark.x) ||
    !Number.isFinite(landmark.y) ||
    !Number.isFinite(landmark.z)
  ) {
    return null;
  }

  const confidence = Math.min(1, Math.max(0, landmark.confidence ?? 0));

  return {
    ...landmark,
    confidence,
    visibility: landmark.visibility ?? confidence,
  };
}

/**
 * Calcula confianza promedio de una lista de landmarks
 */
function averageConfidence(landmarks: Landmark[]): number {
  if (landmarks.length === 0) return 0;
  const sum = landmarks.reduce((acc, lm) => acc + (lm.confidence ?? 0.5), 0);
  return sum / landmarks.length;
}

/**
 * Normaliza una captura RAW a formato interno
 */
export function normalizeRawCapture(raw: RawCapture): NormalizationResult {
  const errors: Array<{
    type:
      | "missing_landmarks"
      | "low_confidence"
      | "invalid_coordinates"
      | "processing_failed";
    severity: "warning" | "error";
    message: string;
    details?: Record<string, unknown>;
  }> = [];

  try {
    // Validación básica
    if (!raw.poseLandmarks || raw.poseLandmarks.length === 0) {
      errors.push({
        type: "missing_landmarks",
        severity: "error",
        message: "No pose landmarks available",
      });
      return {
        capture: null,
        errors,
        success: false,
      };
    }

    // Normalizar pose
    const normalizedPoseLandmarks = raw.poseLandmarks
      .map((lm) => normalizePoseLandmark(lm))
      .filter((lm) => lm !== null) as Landmark[];

    const confidentPoseLandmarks = normalizedPoseLandmarks.filter(
      (lm) => (lm.confidence ?? 0) >= 0.3,
    );

    if (confidentPoseLandmarks.length < 15) {
      errors.push({
        type: "low_confidence",
        severity: "warning",
        message: `Only ${confidentPoseLandmarks.length} pose landmarks with good confidence`,
      });
    }

    const poseConfidence = averageConfidence(normalizedPoseLandmarks);

    // Normalizar manos (opcionales)
    let normalizedLeftHand:
      | { landmarks: Landmark[]; confidence: number }
      | undefined;
    let normalizedRightHand:
      | { landmarks: Landmark[]; confidence: number }
      | undefined;

    if (raw.leftHandLandmarks && raw.leftHandLandmarks.length > 0) {
      const landmarks = raw.leftHandLandmarks
        .map((lm) => normalizeLandmark(lm))
        .filter((lm) => lm !== null) as Landmark[];

      if (landmarks.length > 10) {
        normalizedLeftHand = {
          landmarks,
          confidence: averageConfidence(landmarks),
        };
      }
    }

    if (raw.rightHandLandmarks && raw.rightHandLandmarks.length > 0) {
      const landmarks = raw.rightHandLandmarks
        .map((lm) => normalizeLandmark(lm))
        .filter((lm) => lm !== null) as Landmark[];

      if (landmarks.length > 10) {
        normalizedRightHand = {
          landmarks,
          confidence: averageConfidence(landmarks),
        };
      }
    }

    // Normalizar cara (opcional)
    let normalizedFace: {
      landmarks: Landmark[];
      blendshapes?: Record<string, number>;
      confidence: number;
    } | undefined;

    if (raw.faceLandmarks && raw.faceLandmarks.length > 0) {
      const landmarks = raw.faceLandmarks
        .map((lm) => normalizeLandmark(lm))
        .filter((lm) => lm !== null) as Landmark[];

      if (landmarks.length > 100) {
        const blendshapes = raw.faceBlendshapes ? { ...raw.faceBlendshapes } : {};

        normalizedFace = {
          landmarks,
          blendshapes,
          confidence: averageConfidence(landmarks),
        };
      } else if (raw.faceBlendshapes) {
        // Si no hay landmarks pero sí blendshapes, usarlos igual
        normalizedFace = {
          landmarks: [],
          blendshapes: raw.faceBlendshapes,
          confidence: 0.5,
        };
      }
    }

    const normalized: NormalizedCapture = {
      timestampMs: raw.timestampMs,
      pose: {
        landmarks: normalizedPoseLandmarks,
        confidence: poseConfidence,
      },
      leftHand: normalizedLeftHand,
      rightHand: normalizedRightHand,
      face: normalizedFace,
      isValid: poseConfidence > 0.5 && confidentPoseLandmarks.length > 15,
      source: raw.source ?? "unknown",
      metadata: raw.metadata,
      processingMs: 0, // Timestamps se calculan si se necesita
    };

    return {
      capture: normalized,
      errors,
      success: normalized.isValid,
    };
  } catch (error) {
    errors.push({
      type: "processing_failed",
      severity: "error",
      message: `Normalization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: { error },
    });
    return {
      capture: null,
      errors,
      success: false,
    };
  }
}

/**
 * Normaliza múltiples captures (ej: de un stream de MediaPipe)
 */
export function normalizeRawCaptures(
  raws: RawCapture[]
): Array<{ capture: NormalizedCapture; errors: Array<unknown> }> {
  return raws.map((raw) => {
    const result = normalizeRawCapture(raw);
    return {
      capture: result.capture as NormalizedCapture,
      errors: result.errors,
    };
  });
}
