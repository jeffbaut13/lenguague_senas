/**
 * Ejemplos de datos en formato JSON para uso como referencia
 * Pueden importarse/exportarse desde la UI
 */

/**
 * Ejemplo 1: Avatar Frame básico en JSON
 */
export const EXAMPLE_AVATAR_FRAME_JSON = {
  bones: {
    head: {
      rotation: {
        x: 0.1,
        y: 0.2,
        z: 0.0,
      },
    },
    leftUpperArm: {
      rotation: {
        x: -0.5,
        y: -0.3,
        z: 0.1,
      },
    },
    rightUpperArm: {
      rotation: {
        x: 0.8,
        y: 0.5,
        z: -0.2,
      },
    },
  },
  expressions: {
    happy: 0.6,
    blink: 0.0,
    aa: 0.2,
  },
};

/**
 * Ejemplo 2: Clip de animación en JSON
 * Representa una seña simple que puede importarse
 */
export const EXAMPLE_ANIMATION_CLIP_JSON = {
  name: "example-wave",
  frames: [
    {
      timestampMs: 0,
      bones: {
        rightUpperArm: {
          rotation: { x: 0, y: 0, z: -1.0 },
        },
      },
      expressions: {},
    },
    {
      timestampMs: 300,
      bones: {
        rightUpperArm: {
          rotation: { x: 0.3, y: 0.2, z: -1.1 },
        },
      },
      expressions: { happy: 0.3 },
    },
    {
      timestampMs: 600,
      bones: {
        rightUpperArm: {
          rotation: { x: 0, y: 0, z: -1.0 },
        },
      },
      expressions: {},
    },
  ],
};

/**
 * Ejemplo 3: Entrada de diccionario en JSON
 */
export const EXAMPLE_SIGN_ENTRY_JSON = {
  id: "custom-001",
  gloss: "CUSTOM",
  metadata: {
    id: "custom-001",
    gloss: "CUSTOM",
    definition: "Una seña personalizada para testing",
    language: "LSC",
    dominantHand: "right",
    category: "custom",
  },
  clip: {
    name: "example-custom",
    frames: [
      {
        timestampMs: 0,
        bones: {},
        expressions: { happy: 0.5 },
      },
      {
        timestampMs: 500,
        bones: {},
        expressions: { happy: 0.5 },
      },
    ],
  },
};

/**
 * Convierte ejemplos a strings JSON para uso
 */
export function getExampleClipJSON(): string {
  return JSON.stringify(EXAMPLE_ANIMATION_CLIP_JSON, null, 2);
}

export function getExampleFrameJSON(): string {
  return JSON.stringify(EXAMPLE_AVATAR_FRAME_JSON, null, 2);
}

export function getExampleSignJSON(): string {
  return JSON.stringify(EXAMPLE_SIGN_ENTRY_JSON, null, 2);
}
