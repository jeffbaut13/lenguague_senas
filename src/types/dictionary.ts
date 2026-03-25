/**
 * Tipos para el diccionario de señas
 * Representa entradas reutilizables con contenido lingüístico/semántico
 */

import type { AvatarAnimationClip } from "./motion";

/**
 * Características de forma de mano (handshape)
 * Basadas en lingüística de lengua de signos
 */
export enum HandshapeType {
  FIST = "fist",
  OPEN_PALM = "open_palm",
  POINTING_INDEX = "pointing_index",
  V_SHAPE = "v_shape",
  C_SHAPE = "c_shape",
  O_SHAPE = "o_shape",
  FLAT_HAND = "flat_hand",
  THUMBS_UP = "thumbs_up",
  PEACE = "peace",
  // Más formas según sea necesario
}

/**
 * Ubicación del movimiento en el espacio de signos
 */
export enum LocationInSigningSpace {
  HEAD = "head",
  FACE = "face",
  NECK = "neck",
  SHOULDER = "shoulder",
  TORSO = "torso",
  WAIST = "waist",
  NEUTRAL_SPACE = "neutral_space",
  EXTENDED_SPACE = "extended_space",
}

/**
 * Tipo de movimiento
 */
export enum MovementType {
  ARC_MOTION = "arc",
  STRAIGHT_MOTION = "straight",
  CIRCULAR_MOTION = "circular",
  TREMOLO = "tremolo",
  BOUNCE = "bounce",
  REPEATED_XYZ = "repeated",
}

/**
 * Orientación de mano
 */
export enum HandOrientation {
  PALM_UP = "palm_up",
  PALM_DOWN = "palm_down",
  PALM_LEFT = "palm_left",
  PALM_RIGHT = "palm_right",
  PALM_FACING_SIGNER = "palm_facing_signer",
  PALM_FACING_ADDRESSEE = "palm_facing_addressee",
  FINGERS_UP = "fingers_up",
  FINGERS_DOWN = "fingers_down",
}

/**
 * Rasgos non-manuales (expresión facial, movimiento de cuerpo)
 */
export interface NonManualFeatures {
  facialExpression?: string; // "happy", "surprised", "questioning", etc.
  eyebrowPosition?: "normal" | "raised" | "furrowed";
  headTilt?: "left" | "right" | "forward" | "back" | "none";
  bodyLean?: "left" | "right" | "forward" | "back" | "none";
  mouthShape?: string; // "aa", "ee", "oh", etc.
  breath?: boolean;
  intensity?: "light" | "neutral" | "strong";
}

/**
 * Metadatos lingüísticos y semánticos de una seña
 */
export interface SignMetadata {
  // Identidad
  id: string; // UUID o nombre único
  gloss: string; // Glosa: "THANKS", "HELLO", "QUESTION"
  definition?: string; // Definición en texto

  // Lingüística
  partOfSpeech?: "noun" | "verb" | "adjective" | "adverb" | "preposition";
  language?: string; // "LSC" (Lengua de Signos Colombiana), "LSE", etc.
  dialect?: string; // Variaciones geográficas

  // Estructura fonemática (features de la seña)
  handshape?: {
    dominant?: HandshapeType;
    non_dominant?: HandshapeType;
  };
  location?: LocationInSigningSpace;
  movement?: MovementType;
  orientation?: {
    dominant?: HandOrientation;
    non_dominant?: HandOrientation;
  };
  nonManual?: NonManualFeatures;
  dominantHand?: "right" | "left" | "both";

  // Contexto y semantics
  category?: string; // "greeting", "emotion", "action", "object"
  synonyms?: string[]; // Otras formas de decir lo mismo
  relatedSigns?: string[]; // IDs de señas relacionadas
  context?: string; // Notas sobre cuándo o cómo se usa

  // Metadata técnica
  createdAt?: Date;
  modifiedAt?: Date;
  author?: string;
  source?: string; // "capture", "manual", "imported"
  confidence?: number; // 0-1, qué tan seguro estamos de la definición
  tags?: string[];
}

/**
 * Una entrada del diccionario: clip reproducible con metadata
 */
export interface SignDictionaryEntry {
  id: string; // UUID único
  gloss: string; // Identificador corto/glosa
  clip: AvatarAnimationClip; // El clip reproducible
  metadata: SignMetadata; // Metadata lingüística y semántica
}

/**
 * Diccionario de señas: colección de entradas
 */
export interface SignDictionary {
  id: string; // ID del diccionario
  name: string; // "Diccionario Base LSC"
  language: string; // "LSC", "LSE", "ASL"
  entries: SignDictionaryEntry[]; // Entradas del diccionario
  metadata?: {
    version?: string;
    createdAt?: Date;
    modifiedAt?: Date;
    author?: string;
    license?: string;
    description?: string;
  };
}

/**
 * Palabra clave para búsqueda en diccionario
 */
export interface SignSearchQuery {
  gloss?: string; // Búsqueda por glosa exacta o parcial
  category?: string; // Búsqueda por categoría
  tags?: string[]; // Búsqueda por tags
  definition?: string; // Búsqueda en definición
  limitResults?: number;
}

/**
 * Resultado de búsqueda en diccionario
 */
export interface SignSearchResult {
  entries: SignDictionaryEntry[];
  totalFound: number;
  query: SignSearchQuery;
}
