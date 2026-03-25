/**
 * Tipos para representar captura RAW y normalización.
 * Independientes de la fuente (MediaPipe, Kinect, etc.)
 */

/**
 * Un landmark: posición 3D con confianza
 */
export interface Landmark {
  x: number;
  y: number;
  z: number;
  confidence?: number;
  visibility?: number;
}

/**
 * Captura RAW: datos crudos de cámara / MediaPipe / proveedor
 * Representa un frame de captura sin procesar.
 */
export interface RawCapture {
  timestampMs: number;

  // Pose (28 landmarks: 23 del cuerpo + 5 de manos si están disponibles)
  poseLandmarks: Landmark[];

  // Manos izquierda y derecha (21 landmarks cada una)
  leftHandLandmarks?: Landmark[];
  rightHandLandmarks?: Landmark[];

  // Cara (468 landmarks)
  faceLandmarks?: Landmark[];

  // Blend shapes / expersiones de cara de MediaPipe
  faceBlendshapes?: Record<string, number>;

  // Metadata
  confidence?: number;
  source?: string; // "mediapipe", "kinect", "mock"
  metadata?: Record<string, unknown>;
}

/**
 * Captura normalizada a sistema propio
 * Conversión de coordenadas y limpieza de datos.
 *
 * Aquí normalizamos:
 * - Coordenadas a espacio local del avatar
 * - Confianza / visibilidad
 * - Relleno de datos faltantes
 */
export interface NormalizedCapture {
  timestampMs: number;

  // Pose normalizada
  pose: {
    landmarks: Landmark[];
    confidence: number;
  };

  // Manos normalizadas
  leftHand?: {
    landmarks: Landmark[];
    confidence: number;
  };

  rightHand?: {
    landmarks: Landmark[];
    confidence: number;
  };

  // Cara normalizada
  face?: {
    landmarks: Landmark[];
    blendshapes?: Record<string, number>;
    confidence: number;
  };

  // Metadata
  isValid: boolean;
  source: string;
  metadata?: Record<string, unknown>;
  processingMs?: number;
}

/**
 * Errores de normalización
 */
export interface CaptureValidationError {
  type:
    | "missing_landmarks"
    | "low_confidence"
    | "invalid_coordinates"
    | "processing_failed";
  severity: "warning" | "error";
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Resultado de normalización con errores
 */
export interface NormalizationResult {
  capture: NormalizedCapture | null;
  errors: CaptureValidationError[];
  success: boolean;
}
