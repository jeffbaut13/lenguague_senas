/**
 * Mocks de diccionario de señas
 * Entradas de ejemplo con clips reproducibles
 */

import type {
  SignDictionary,
  SignDictionaryEntry,
  SignMetadata,
} from "@/types/dictionary";
import {
  HandshapeType,
  LocationInSigningSpace,
  MovementType,
  HandOrientation,
} from "@/types/dictionary";
import type { AvatarAnimationClip } from "@/types/motion";
import { waveRightClip } from "./waveRight.clip.mock";
import {
  validationRightHandChinCalibratedFrame,
  validationRightHandChinFinalFrame,
  validationRightHandChinFrame,
} from "./avatarFrame.mock";

/**
 * Metadata de ejemplo: GRACIAS (THANKS)
 */
export const THANKS_METADATA: SignMetadata = {
  id: "thanks-001",
  gloss: "THANKS",
  definition: "Expresión de gratitud usando ambas manos",
  partOfSpeech: "verb",
  language: "LSC", // Lengua de Signos Colombiana
  handshape: {
    dominant: HandshapeType.OPEN_PALM,
    non_dominant: HandshapeType.OPEN_PALM,
  },
  location: LocationInSigningSpace.NEUTRAL_SPACE,
  movement: MovementType.STRAIGHT_MOTION,
  orientation: {
    dominant: HandOrientation.PALM_FACING_ADDRESSEE,
    non_dominant: HandOrientation.PALM_FACING_ADDRESSEE,
  },
  dominantHand: "right",
  category: "greeting",
  context:
    "Se usa para expresar gratitud a alguien. Gesto natural y universal en lengua de señas.",
  nonManual: {
    facialExpression: "happy",
    intensity: "neutral",
  },
  createdAt: new Date("2025-01-01"),
  source: "manual",
  confidence: 0.95,
  tags: ["greeting", "positive", "emotion"],
};

/**
 * Entrada del diccionario: GRACIAS
 */
export const THANKS_ENTRY: SignDictionaryEntry = {
  id: "thanks-entry-001",
  gloss: "THANKS",
  clip: waveRightClip, // Reutiliza el clip de ejemplo existente
  metadata: THANKS_METADATA,
};

/**
 * Metadata de ejemplo: SI (YES)
 * Movimiento de cabeza vertical (sí sí sí)
 */
export const YES_METADATA: SignMetadata = {
  id: "yes-001",
  gloss: "SI",
  definition: "Afirmación. Respondiendo que sí a una pregunta.",
  partOfSpeech: "verb",
  language: "LSC",
  handshape: {
    dominant: HandshapeType.FIST,
  },
  location: LocationInSigningSpace.HEAD,
  movement: MovementType.STRAIGHT_MOTION,
  dominantHand: "right",
  category: "answer",
  context:
    "Movimiento de cabeza vertical. Puede ir acompañado de expresión facial de confirmación.",
  nonManual: {
    facialExpression: "neutral",
    headTilt: "none",
    intensity: "neutral",
  },
  createdAt: new Date("2025-01-05"),
  source: "manual",
  confidence: 0.98,
  tags: ["answer", "affirmative"],
};

/**
 * Clip de ejemplo: movimiento de cabeza SI
 */
const YES_CLIP: AvatarAnimationClip = {
  name: "sign-yes",
  frames: [
    {
      timestampMs: 0,
      bones: {}, // Posición neutral
      expressions: {},
    },
    {
      timestampMs: 300,
      bones: {
        head: {
          rotation: {
            x: 0.5, // Inclinación hacia arriba
            y: 0,
            z: 0,
          },
        },
        neck: {
          rotation: {
            x: 0.3,
            y: 0,
            z: 0,
          },
        },
      },
      expressions: { happy: 0.3 },
    },
    {
      timestampMs: 600,
      bones: {
        head: {
          rotation: {
            x: 0.3,
            y: 0,
            z: 0,
          },
        },
        neck: {
          rotation: {
            x: 0.2,
            y: 0,
            z: 0,
          },
        },
      },
      expressions: { happy: 0.3 },
    },
    {
      timestampMs: 900,
      bones: {
        head: {
          rotation: {
            x: 0,
            y: 0,
            z: 0,
          },
        },
        neck: {
          rotation: {
            x: 0,
            y: 0,
            z: 0,
          },
        },
      },
      expressions: {},
    },
  ],
};

/**
 * Entrada del diccionario: SI
 */
export const YES_ENTRY: SignDictionaryEntry = {
  id: "yes-entry-001",
  gloss: "SI",
  clip: YES_CLIP,
  metadata: YES_METADATA,
};

/**
 * Metadata de ejemplo: NO
 * Movimiento de cabeza horizontal (no no no)
 */
export const NO_METADATA: SignMetadata = {
  id: "no-001",
  gloss: "NO",
  definition: "Negación. Rechazar algo o responder negativamente.",
  partOfSpeech: "verb",
  language: "LSC",
  handshape: {
    dominant: HandshapeType.FIST,
  },
  location: LocationInSigningSpace.HEAD,
  movement: MovementType.ARC_MOTION,
  dominantHand: "right",
  category: "answer",
  context:
    "Movimiento de cabeza horizontal izquierda-derecha. Expresión facial seria o neutra.",
  nonManual: {
    facialExpression: "neutral",
    headTilt: "none",
    intensity: "neutral",
  },
  createdAt: new Date("2025-01-06"),
  source: "manual",
  confidence: 0.98,
  tags: ["answer", "negative"],
};

/**
 * Clip de ejemplo: movimiento de cabeza NO
 */
const NO_CLIP: AvatarAnimationClip = {
  name: "sign-no",
  frames: [
    {
      timestampMs: 0,
      bones: {},
      expressions: {},
    },
    {
      timestampMs: 300,
      bones: {
        head: {
          rotation: {
            x: 0,
            y: -0.7, // Giro hacia la izquierda
            z: 0,
          },
        },
        neck: {
          rotation: {
            x: 0,
            y: -0.4,
            z: 0,
          },
        },
      },
      expressions: {},
    },
    {
      timestampMs: 600,
      bones: {
        head: {
          rotation: {
            x: 0,
            y: 0.7, // Giro hacia la derecha
            z: 0,
          },
        },
        neck: {
          rotation: {
            x: 0,
            y: 0.4,
            z: 0,
          },
        },
      },
      expressions: {},
    },
    {
      timestampMs: 900,
      bones: {
        head: {
          rotation: {
            x: 0,
            y: 0,
            z: 0,
          },
        },
        neck: {
          rotation: {
            x: 0,
            y: 0,
            z: 0,
          },
        },
      },
      expressions: {},
    },
  ],
};

/**
 * Entrada del diccionario: NO
 */
export const NO_ENTRY: SignDictionaryEntry = {
  id: "no-entry-001",
  gloss: "NO",
  clip: NO_CLIP,
  metadata: NO_METADATA,
};

export const VALIDATION_RIGHT_HAND_CHIN_METADATA: SignMetadata = {
  id: "validation-right-hand-chin-001",
  gloss: "VALIDATION-RIGHT-HAND-CHIN",
  definition:
    "Pose estática de validación con mano derecha cerca del mentón para revisar torso, cabeza, hombro, codo y mano antes de integrar MediaPipe.",
  partOfSpeech: "verb",
  language: "LSC",
  handshape: {
    dominant: HandshapeType.OPEN_PALM,
    non_dominant: HandshapeType.FLAT_HAND,
  },
  location: LocationInSigningSpace.FACE,
  movement: MovementType.STRAIGHT_MOTION,
  orientation: {
    dominant: HandOrientation.PALM_FACING_SIGNER,
    non_dominant: HandOrientation.PALM_DOWN,
  },
  dominantHand: "right",
  category: "validation",
  context: "Mock técnico para validar retarget de torso, cabeza y brazo derecho.",
  nonManual: {
    facialExpression: "happy",
    headTilt: "left",
    intensity: "light",
    mouthShape: "aa",
  },
  createdAt: new Date("2026-03-25"),
  source: "manual",
  confidence: 1,
  tags: ["validation", "mock", "pre-mediapipe", "right-hand", "chin"],
};

const VALIDATION_RIGHT_HAND_CHIN_CLIP: AvatarAnimationClip = {
  name: "validation-right-hand-chin",
  frames: [validationRightHandChinFrame],
};

export const VALIDATION_RIGHT_HAND_CHIN_ENTRY: SignDictionaryEntry = {
  id: "validation-right-hand-chin-entry-001",
  gloss: "VALIDATION-RIGHT-HAND-CHIN",
  clip: VALIDATION_RIGHT_HAND_CHIN_CLIP,
  metadata: VALIDATION_RIGHT_HAND_CHIN_METADATA,
};

export const VALIDATION_RIGHT_HAND_CHIN_CALIBRATED_METADATA: SignMetadata = {
  ...VALIDATION_RIGHT_HAND_CHIN_METADATA,
  id: "validation-right-hand-chin-calibrated-001",
  gloss: "VALIDATION-RIGHT-HAND-CHIN-CALIBRATED",
  definition:
    "Version calibrada de la pose de validacion para el avatar actual, ajustada con pruebas unitarias por hueso/eje.",
  source: "manual-calibrated",
  tags: ["validation", "calibrated", "mock", "pre-mediapipe", "right-hand", "chin"],
};

const VALIDATION_RIGHT_HAND_CHIN_CALIBRATED_CLIP: AvatarAnimationClip = {
  name: "validation-right-hand-chin-calibrated",
  frames: [validationRightHandChinCalibratedFrame],
};

export const VALIDATION_RIGHT_HAND_CHIN_CALIBRATED_ENTRY: SignDictionaryEntry = {
  id: "validation-right-hand-chin-calibrated-entry-001",
  gloss: "VALIDATION-RIGHT-HAND-CHIN-CALIBRATED",
  clip: VALIDATION_RIGHT_HAND_CHIN_CALIBRATED_CLIP,
  metadata: VALIDATION_RIGHT_HAND_CHIN_CALIBRATED_METADATA,
};

export const VALIDATION_RIGHT_HAND_CHIN_FINAL_METADATA: SignMetadata = {
  ...VALIDATION_RIGHT_HAND_CHIN_METADATA,
  id: "validation-right-hand-chin-final-001",
  gloss: "VALIDATION-RIGHT-HAND-CHIN-FINAL",
  definition:
    "Version final de la pose de validacion compuesta usando armCalibrationMap del avatar actual.",
  source: "manual-final",
  tags: ["validation", "final", "calibrated", "pre-mediapipe", "right-hand", "chin"],
};

const VALIDATION_RIGHT_HAND_CHIN_FINAL_CLIP: AvatarAnimationClip = {
  name: "validation-right-hand-chin-final",
  frames: [validationRightHandChinFinalFrame],
};

export const VALIDATION_RIGHT_HAND_CHIN_FINAL_ENTRY: SignDictionaryEntry = {
  id: "validation-right-hand-chin-final-entry-001",
  gloss: "VALIDATION-RIGHT-HAND-CHIN-FINAL",
  clip: VALIDATION_RIGHT_HAND_CHIN_FINAL_CLIP,
  metadata: VALIDATION_RIGHT_HAND_CHIN_FINAL_METADATA,
};

/**
 * Diccionario modelo: Diccionario Base LSC
 */
export const MOCK_SIGN_DICTIONARY: SignDictionary = {
  id: "lsc-base-001",
  name: "Diccionario Base LSC",
  language: "LSC",
  entries: [
    THANKS_ENTRY,
    YES_ENTRY,
    NO_ENTRY,
    VALIDATION_RIGHT_HAND_CHIN_ENTRY,
    VALIDATION_RIGHT_HAND_CHIN_CALIBRATED_ENTRY,
    VALIDATION_RIGHT_HAND_CHIN_FINAL_ENTRY,
  ],
  metadata: {
    version: "1.0.0",
    createdAt: new Date("2025-01-01"),
    description:
      "Diccionario base de ejemplo para lengua de signos colombiana",
    author: "VRM Avatar Team",
    license: "CC BY-SA 4.0",
  },
};

/**
 * Función auxiliar: buscar entrada por glosa
 */
export function findSignByGloss(gloss: string): SignDictionaryEntry | undefined {
  return MOCK_SIGN_DICTIONARY.entries.find(
    (entry) => entry.gloss.toLowerCase() === gloss.toLowerCase(),
  );
}

/**
 * Función auxiliar: listar todas las glosas
 */
export function listAllGlosses(): string[] {
  return MOCK_SIGN_DICTIONARY.entries.map((entry) => entry.gloss);
}

/**
 * Función auxiliar: buscar por categoría
 */
export function findSignsByCategory(category: string): SignDictionaryEntry[] {
  return MOCK_SIGN_DICTIONARY.entries.filter(
    (entry) =>
      entry.metadata.category &&
      entry.metadata.category.toLowerCase() === category.toLowerCase(),
  );
}
