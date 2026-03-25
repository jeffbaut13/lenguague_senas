/**
 * Mocks de captura RAW (MediaPipe)
 * Datos de ejemplo para testing sin cámara en vivo
 */

import type { RawCapture, Landmark } from "@/types/capture";

type MockScenario = "neutral" | "greeting" | "yes" | "no" | "self" | "hands_up";

const HAND_SPREAD_PATTERN = [
  { x: 0.0, y: 0.0 },
  { x: 0.03, y: 0.08 },
  { x: 0.05, y: 0.15 },
  { x: 0.08, y: 0.21 },
  { x: 0.12, y: 0.26 },
] as const;

/**
 * Landmark neutro (posición 0,0,0)
 */
const ZERO_LANDMARK: Landmark = {
  x: 0,
  y: 0,
  z: 0,
  confidence: 1,
  visibility: 1,
};

function createLandmarks(count: number): Landmark[] {
  return Array.from({ length: count }, () => ({ ...ZERO_LANDMARK }));
}

function createMockCaptureBase(
  scenario: MockScenario,
  timestampMs: number,
): RawCapture {
  return {
    timestampMs,
    poseLandmarks: createLandmarks(33),
    leftHandLandmarks: createLandmarks(21),
    rightHandLandmarks: createLandmarks(21),
    faceLandmarks: createLandmarks(468),
    faceBlendshapes: {
      eyeBlinkLeft: 0,
      eyeBlinkRight: 0,
      eyeLookDownLeft: 0,
      eyeLookDownRight: 0,
      eyeLookUpLeft: 0,
      eyeLookUpRight: 0,
      mouthOpen: 0,
      mouthSmile: 0,
      headTilt: 0,
      jawOpen: 0,
    },
    confidence: 1,
    source: "mock",
    metadata: {
      mockScenario: scenario,
    },
  };
}

function populateOpenHand(
  hand: Landmark[] | undefined,
  wrist: { x: number; y: number; z: number },
  direction: 1 | -1,
) {
  if (!hand) {
    return;
  }

  hand[0] = {
    x: wrist.x,
    y: wrist.y,
    z: wrist.z,
    confidence: 0.95,
  };

  for (let finger = 0; finger < 5; finger += 1) {
    for (let joint = 0; joint < 4; joint += 1) {
      const index = 1 + finger * 4 + joint;
      const pattern = HAND_SPREAD_PATTERN[finger];
      hand[index] = {
        x: wrist.x + pattern.x * direction,
        y: wrist.y + pattern.y + joint * 0.03,
        z: wrist.z - joint * 0.01,
        confidence: 0.9,
      };
    }
  }
}

/**
 * Pose en posición neutral (de pie, brazos a los lados)
 * Simulamos 33 landmarks de MediaPipe Pose
 */
export function createNeutralRawCapture(timestampMs: number = 0): RawCapture {
  return createMockCaptureBase("neutral", timestampMs);
}

/**
 * Mock: persona saludando
 * Brazos levantados, expresión feliz
 */
export function createGreetingRawCapture(timestampMs: number = 0): RawCapture {
  const capture = createMockCaptureBase("greeting", timestampMs);

  // Ajustar pose: hombros y brazos levantados
  // Index 11 = left shoulder, 12 = right shoulder
  // Index 13 = left elbow, 14 = right elbow
  // Index 15 = left wrist, 16 = right wrist

  capture.poseLandmarks[11] = { x: -0.5, y: 1.2, z: 0.3, confidence: 0.95 };
  capture.poseLandmarks[12] = { x: 0.5, y: 1.2, z: 0.3, confidence: 0.95 };
  capture.poseLandmarks[13] = { x: -0.8, y: 0.8, z: 0.3, confidence: 0.95 };
  capture.poseLandmarks[14] = { x: 0.8, y: 0.8, z: 0.3, confidence: 0.95 };
  capture.poseLandmarks[15] = { x: -1, y: 0.5, z: 0.3, confidence: 0.95 };
  capture.poseLandmarks[16] = { x: 1, y: 0.5, z: 0.3, confidence: 0.95 };

  // Manos abiertas (landmarks en posición de palma abierta)
  populateOpenHand(capture.leftHandLandmarks, { x: -1, y: 0.5, z: 0.3 }, -1);
  populateOpenHand(capture.rightHandLandmarks, { x: 1, y: 0.5, z: 0.3 }, 1);

  // Expresión facial: sonrisa
  capture.faceBlendshapes = {
    mouthSmile: 0.7,
    eyeBlinkLeft: 0.1,
    eyeBlinkRight: 0.1,
  };

  capture.confidence = 0.92;
  return capture;
}

/**
 * Mock: persona diciendo "sí" (movimiento vertical de cabeza)
 */
export function createYesNodRawCapture(frameIndex: number): RawCapture {
  const timestampMs = frameIndex * 33; // ~30fps
  const capture = createMockCaptureBase("yes", timestampMs);

  // Simular movimiento de cabeza vertical usando seno
  const headYOffset = Math.sin((frameIndex / 10) * Math.PI) * 0.3;

  // Indice 0 = NOSE, afecta a toda la cara
  capture.poseLandmarks[0] = {
    x: 0,
    y: headYOffset,
    z: 0,
    confidence: 1,
  };

  // Small smile
  capture.faceBlendshapes = {
    mouthSmile: 0.3 + Math.abs(headYOffset) * 0.2,
    eyeBlinkLeft: 0.03,
    eyeBlinkRight: 0.03,
  };

  return capture;
}

/**
 * Mock: persona diciendo "no" (movimiento horizontal de cabeza izq-der)
 */
export function createNoHeadShakeRawCapture(frameIndex: number): RawCapture {
  const timestampMs = frameIndex * 33;
  const capture = createMockCaptureBase("no", timestampMs);

  // Simular movimiento de cabeza horizontal
  const headXOffset = Math.sin((frameIndex / 12) * Math.PI * 2) * 0.5;

  capture.poseLandmarks[0] = {
    x: headXOffset,
    y: 0,
    z: 0,
    confidence: 1,
  };

  // Slight frown / neutral mouth
  capture.faceBlendshapes = {
    mouthSmile: 0,
    eyeBlinkLeft: 0.02,
    eyeBlinkRight: 0.02,
  };

  return capture;
}

/**
 * Mock: persona con mano en pecho (para palabras sobre sí mismo)
 */
export function createSelfReferenceRawCapture(timestampMs: number = 0): RawCapture {
  const capture = createMockCaptureBase("self", timestampMs);

  // Mano derecha en el pecho
  capture.poseLandmarks[16] = { x: 0.2, y: 0.8, z: -0.5, confidence: 0.95 };

  // Mano derecha extendida hacia el pecho
  if (capture.rightHandLandmarks) {
    capture.rightHandLandmarks[0] = {
      x: 0.2,
      y: 0.8,
      z: -0.5,
      confidence: 0.95,
    };
    // Otros landmarks de mano cerca del pecho
    populateOpenHand(capture.rightHandLandmarks, { x: 0.2, y: 0.8, z: -0.5 }, 1);
  }

  // Expresión seria o normal
  capture.faceBlendshapes = {
    mouthSmile: 0.2,
  };

  return capture;
}

/**
 * Mock: persona con ambas manos levantadas (celebración o pregunta)
 */
export function createHandsUpRawCapture(timestampMs: number = 0): RawCapture {
  const capture = createMockCaptureBase("hands_up", timestampMs);

  // Ambos brazos y manos levantadas
  capture.poseLandmarks[11] = { x: -0.4, y: 1.0, z: 0.2, confidence: 0.95 }; // left shoulder
  capture.poseLandmarks[12] = { x: 0.4, y: 1.0, z: 0.2, confidence: 0.95 }; // right shoulder
  capture.poseLandmarks[13] = { x: -0.5, y: 0.5, z: 0.2, confidence: 0.95 }; // left elbow
  capture.poseLandmarks[14] = { x: 0.5, y: 0.5, z: 0.2, confidence: 0.95 }; // right elbow
  capture.poseLandmarks[15] = { x: -0.5, y: 0.1, z: 0.2, confidence: 0.95 }; // left wrist
  capture.poseLandmarks[16] = { x: 0.5, y: 0.1, z: 0.2, confidence: 0.95 }; // right wrist

  // Manos abiertas
  populateOpenHand(capture.leftHandLandmarks, { x: -0.5, y: 0.1, z: 0.2 }, -1);
  populateOpenHand(capture.rightHandLandmarks, { x: 0.5, y: 0.1, z: 0.2 }, 1);

  // Expresión alegre
  capture.faceBlendshapes = {
    mouthSmile: 0.8,
    eyeBlinkLeft: 0.05,
    eyeBlinkRight: 0.05,
  };

  return capture;
}
